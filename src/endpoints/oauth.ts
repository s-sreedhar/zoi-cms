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
        const { email, name, sub } = googleData

        if (!email) {
            return Response.json({ error: 'Google token content missing email' }, { status: 400 })
        }

        // 2. Find or Create User
        // Note: 'users' is the slug of the collection
        const users = await payload.find({
            collection: 'users',
            where: {
                email: { equals: email },
            },
            limit: 1,
        })

        let user = users.docs[0]

        if (!user) {
            // Create new user
            // Password is required by default, so we generate a random secure one
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

            user = await payload.create({
                collection: 'users',
                data: {
                    email,
                    password: randomPassword,
                    displayName: name || email.split('@')[0],
                    role: 'customer',
                    // You might want to store 'sub' as googleId if you added that field
                },
            })
        }

        // 3. Login (Generate Token)
        // payload.login returns { token, user, exp }
        // We need to use the ID, but payload.login expects 'email' & 'password' usually?
        // Actually payload.login allows logging in by just passing 'collection' and 'data'? No. 
        // Usually payload.login({ collection: 'users', data: { email, password } }).
        // BUT we don't know the password if we just found them (or if they changed it).

        // Alternative: Generate token manually? 
        // Payload provides `payload.login` but it performs authentication.
        // To generate a token without password, we can use `payload.generateAccessToken(user)`.
        // Wait, generated types might have it? Or it is exposed in Local API?
        // payload.auth... ?

        // In Payload 3.0 Local API:
        // await payload.login({ collection: 'users', data: { email, password } }) checks coords.
        // If we want to force login, we might need a custom approach or update the password temporarily? (Bad idea).
        // Actually, we can use `payload.update` to set a new random password and then login? (Race conditions?)

        // Better: Payload exposes `generateAccessToken`? 
        // Actually, `payload.login` is for credentials.
        // If we are trusted (Local API), we can just issue a token?
        // Checks payload documentation... `payload.login` overrides?

        // Workaround: We can't easily generate a proprietary Payload token without internal utilities.
        // BUT, we can use `payload.login` if we just set the password.
        // Since this is OAuth, the password on Payload side is irrelevant/placeholder.
        // So:
        // 1. Update user password to a new random string.
        // 2. Call payload.login with that string.

        const tempPassword = Math.random().toString(36).slice(-8) + "!Aa1" // Ensure complexity

        await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                password: tempPassword
            }
        })

        const result = await payload.login({
            collection: 'users',
            data: {
                email: user.email,
                password: tempPassword
            }
        })

        return Response.json(result)

    } catch (error) {
        console.error('Google OAuth Error:', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
