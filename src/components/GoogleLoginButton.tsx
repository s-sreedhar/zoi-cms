'use client'

import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../providers/AuthProvider'
import { useRouter } from 'next/navigation'

export default function GoogleLoginButton() {
    const { login } = useAuth()
    const router = useRouter()

    return (
        <GoogleLogin
            onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                    await login(credentialResponse.credential)
                    router.push('/dashboard')
                }
            }}
            onError={() => {
                console.log('Login Failed')
            }}
            useOneTap
        />
    )
}
