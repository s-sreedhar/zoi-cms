import { PayloadHandler } from 'payload'
import { CollectionConfig } from 'payload'

export const googleOauthHandler: PayloadHandler = async (req) => {
    const { payload } = req
    const { token } = req.json ? await req.json() : { token: null }

    if (!token) {
        return Response.json({ error: 'Missing token' }, { status: 400 })
    }

    try {
        // 1. Verify Google Token
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)

        if (!googleRes.ok) {
            return Response.json({ error: 'Invalid Google token' }, { status: 401 })
        }

        const googleData = await googleRes.json()
        const { email, name, sub, picture } = googleData

        console.log('Google Auth Data:', { email, name, sub, picture })

        if (!email) {
            console.error('Missing email in Google data')
            return Response.json({ error: 'Google token content missing email' }, { status: 400 })
        }

        // 2. Find or Create User
        const users = await payload.find({
            collection: 'users',
            where: {
                or: [
                    { email: { equals: email } },
                    { googleId: { equals: sub } }
                ]
            },
            limit: 1,
        })

        let user = users.docs[0]

        if (!user) {
            console.log('Creating new Google user:', email)
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

            user = await payload.create({
                collection: 'users',
                data: {
                    email,
                    password: randomPassword,
                    displayName: name || email.split('@')[0],
                    role: 'customer',
                    googleId: sub,
                    imageUrl: picture,
                },
            })
        } else {
            console.log('Found existing user for Google auth:', email)
            // Update existing user with Google info if missing
            if (!user.googleId || !user.imageUrl) {
                console.log('Updating user with Google ID and image URL')
                user = await payload.update({
                    collection: 'users',
                    id: user.id,
                    data: {
                        googleId: sub,
                        imageUrl: picture,
                    },
                })
            }
        }

        const tempPassword = Math.random().toString(36).slice(-8) + "!Aa1"
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const ip = req.headers.get('x-forwarded-for') || 'unknown';

        await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                password: tempPassword,
                activeSessionId: sessionId,
                lastIP: ip,
                lastLogin: new Date().toISOString()
            }
        })

        const result = await payload.login({
            collection: 'users',
            data: {
                email: user.email,
                password: tempPassword
            }
        })

        console.log('Payload login successful for:', user.email, 'Session:', sessionId)
        return Response.json({ ...result, activeSessionId: sessionId })

    } catch (error) {
        console.error('Google OAuth Internal Error:', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
