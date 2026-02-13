'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

interface User {
    id: string
    email: string
    displayName?: string
    role?: string
    imageUrl?: string
    batch?: string | { id: string; name?: string }
}

interface AuthContextType {
    user: User | null
    login: (token: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/users/me')
                if (res.ok) {
                    const data = await res.json()
                    if (data?.user) {
                        setUser(data.user)
                    }
                }
            } catch (error) {
                console.error('Session check failed', error)
            } finally {
                setIsLoading(false)
            }
        }

        checkSession()
    }, [])

    const login = async (token: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/users/oauth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            })

            if (res.ok) {
                const data = await res.json()
                if (data?.user) {
                    setUser(data.user)
                }
            } else {
                console.error('Login failed')
            }
        } catch (error) {
            console.error('Login error', error)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        setIsLoading(true)
        try {
            await fetch('/api/users/logout', { method: 'POST' })
            setUser(null)
        } catch (error) {
            console.error('Logout error', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <AuthContext.Provider value={{ user, login, logout, isLoading }}>
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
