import React, { createContext, useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    console.log('AuthContext: Checking auth status...')
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        credentials: 'include'
      })

      console.log('AuthContext: Response status:', res.status)
      if (res.ok) {
        const body = await res.json()
        console.log('AuthContext: Response body:', body)
        if (body.ok) {
          console.log('AuthContext: Setting user:', body.datos)
          setUser(body.datos)
        }
      } else {
        console.log('AuthContext: Response not ok, clearing user')
        setUser(null)
      }
    } catch (err) {
      console.log('AuthContext: Error checking auth:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.log('Error al cerrar sesión')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
