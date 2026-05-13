import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const API_URL = 'http://localhost:5000' // backend

const initialRegister = { nombre: '', apellido: '', email: '', password: '', nacionalidad: '' }
const initialLogin = { email: '', password: '' }

function Auth() {
  const navigate = useNavigate()
  const { user, setUser, loading: contextLoading, checkAuthStatus } = useContext(AuthContext)
  const [mode, setMode] = useState('login')
  const [registerData, setRegisterData] = useState(initialRegister)
  const [loginData, setLoginData] = useState(initialLogin)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!registerData.nombre || !registerData.apellido || !registerData.email || !registerData.password) {
      setError('Completa todos los campos obligatorios.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Importante: enviar cookies
        body: JSON.stringify(registerData),
      })
      const body = await res.json()

      if (!body.ok) {
        setError(body.mensaje || 'Error registrando usuario')
        setLoading(false)
        return
      }

      setUser(body.datos)
      setMessage('Registro exitoso. Bienvenido ' + body.datos.nombre)
      setRegisterData(initialRegister)
      // Actualizar contexto
      await checkAuthStatus()
      navigate('/')
    } catch (err) {
      setError('No se pudo conectar con el backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!loginData.email || !loginData.password) {
      setError('Completa email y contraseña.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Importante: enviar cookies
        body: JSON.stringify(loginData),
      })
      const body = await res.json()

      if (!body.ok) {
        setError(body.mensaje || 'Credenciales inválidas')
        setLoading(false)
        return
      }

      setUser(body.datos)
      setMessage('Inicio de sesión correcto. Hola ' + body.datos.nombre)
      setLoginData(initialLogin)
      // Actualizar contexto
      await checkAuthStatus()
      navigate('/')
    } catch (err) {
      setError('No se pudo conectar con el backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.log('Error al cerrar sesión')
    } finally {
      setUser(null)
      setMode('login')
      setMessage('Sesión cerrada.')
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card text-white bg-dark border-secondary shadow">
            <div className="card-body">
              <h3 className="card-title text-center mb-3">Iniciar Sesión / Registro</h3>

              {user ? (
                <div className="alert alert-success" role="alert">
                  ¡Conectado como <strong>{user.nombre} {user.apellido}</strong> ({user.email})
                  <br />
                  <span className="badge bg-info me-2">{user.rol}</span>
                  <span className="badge bg-warning">Puntos: {user.puntos}</span>
                  {user.nacionalidad && <span className="badge bg-secondary ms-2">{user.nacionalidad}</span>}
                  <br />
                  <button className="btn btn-sm btn-outline-light mt-2" onClick={handleLogout}>Cerrar sesión</button>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-center mb-3">
                    <button className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-outline-light'} me-2`} onClick={() => setMode('login')}>Iniciar Sesión</button>
                    <button className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setMode('register')}>Registrarse</button>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}
                  {message && <div className="alert alert-success">{message}</div>}

                  {mode === 'register' ? (
                    <form onSubmit={handleRegister}>
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <label className="form-label">Nombre *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={registerData.nombre}
                            onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="form-label">Apellido *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={registerData.apellido}
                            onChange={(e) => setRegisterData({ ...registerData, apellido: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Contraseña *</label>
                        <input
                          type="password"
                          className="form-control"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Nacionalidad</label>
                        <input
                          type="text"
                          className="form-control"
                          value={registerData.nacionalidad}
                          onChange={(e) => setRegisterData({ ...registerData, nacionalidad: e.target.value })}
                          placeholder="Opcional"
                        />
                      </div>
                      <button type="submit" className="btn btn-success w-100" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin}>
                      <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
