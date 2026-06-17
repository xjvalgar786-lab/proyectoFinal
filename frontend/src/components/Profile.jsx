import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const API_URL = 'https://backend-production-966f2.up.railway.app'

function Profile() {
  const { user, setUser } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    nacionalidad: '',
    password: ''
  })
  const [stats, setStats] = useState({
    puntos: 0,
    partidosJugados: 0,
    partidosGanados: 0,
    partidosPerdidos: 0,
    torneosInscritos: 0
  })
  const [puntosHistory, setPuntosHistory] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  console.log('Profile component rendered, user:', user, 'loading:', loading)

  // Verificar autenticación al cargar
  useEffect(() => {
    console.log('Profile useEffect - user check:', user)
    if (!user) {
      setLoading(false)
      setError('Debes iniciar sesión para ver tu perfil.')
      return
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      nacionalidad: user.nacionalidad || '',
      password: ''
    })
    setStats({
      puntos: user.puntos || 0,
      partidosJugados: user.stats?.partidosJugados || 0,
      partidosGanados: user.stats?.partidosGanados || 0,
      partidosPerdidos: user.stats?.partidosPerdidos || 0,
      torneosInscritos: user.stats?.torneosInscritos || 0
    })
  }, [user])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        // Obtener perfil actualizado
        const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'GET',
          credentials: 'include'
        })
        const profileBody = await profileRes.json()

        if (profileBody.ok) {
          const userData = profileBody.datos
          setFormData({
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
            email: userData.email || '',
            nacionalidad: userData.nacionalidad || '',
            password: ''
          })
          setStats({
            puntos: userData.puntos || 0,
            partidosJugados: userData.stats?.partidosJugados || 0,
            partidosGanados: userData.stats?.partidosGanados || 0,
            partidosPerdidos: userData.stats?.partidosPerdidos || 0,
            torneosInscritos: userData.stats?.torneosInscritos || 0
          })
        }

        // Obtener historial de puntos
        const historyRes = await fetch(`${API_URL}/api/rankings/puntos/history`, {
          method: 'GET',
          credentials: 'include'
        })
        const historyBody = await historyRes.json()

        if (historyBody.ok) {
          setPuntosHistory(historyBody.datos)
        }

      } catch (err) {
        setError('Error al cargar los datos del perfil.')
        console.error('Error fetching profile data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const PuntosChart = ({ data }) => {
    if (!data || data.length === 0) return null

    const width = 300
    const height = 150
    const padding = 20

    // Encontrar valores máximo y mínimo
    const maxPuntos = Math.max(...data.map(d => d.puntos_totales))
    const minPuntos = Math.min(...data.map(d => d.puntos_totales))

    // Crear puntos para la línea
    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1)
      const y = height - padding - ((d.puntos_totales - minPuntos) * (height - 2 * padding)) / (maxPuntos - minPuntos || 1)
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="bg-secondary rounded-3 p-3">
        <h6 className="text-white mb-3">Evolución de Puntos</h6>
        <svg width={width} height={height} className="w-100">
          {/* Líneas de fondo */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = height - padding - (ratio * (height - 2 * padding))
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#495057"
                strokeWidth="1"
                opacity="0.3"
              />
            )
          })}

          {/* Línea principal */}
          <polyline
            points={points}
            fill="none"
            stroke="#007bff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos */}
          {data.map((d, i) => {
            const x = padding + (i * (width - 2 * padding)) / (data.length - 1)
            const y = height - padding - ((d.puntos_totales - minPuntos) * (height - 2 * padding)) / (maxPuntos - minPuntos || 1)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#007bff"
                stroke="#fff"
                strokeWidth="2"
              />
            )
          })}
        </svg>
        <div className="d-flex justify-content-between mt-2">
          <small className="text-white">
            {data.length > 0 ? `${data[0].mes}/${data[0].ano}` : ''}
          </small>
          <small className="text-white">
            {data.length > 0 ? `${data[data.length - 1].mes}/${data[data.length - 1].ano}` : ''}
          </small>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!formData.nombre || !formData.apellido || !formData.email) {
      setError('Nombre, apellido y email son obligatorios.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const body = await response.json()
      if (!body.ok) {
        setError(body.mensaje || 'Error al actualizar el perfil')
        return
      }

      setUser(body.datos)
      setFormData((prev) => ({ ...prev, password: '' }))
      setStats({
        puntos: body.datos.puntos || 0,
        partidosJugados: body.datos.stats?.partidosJugados || stats.partidosJugados,
        partidosGanados: body.datos.stats?.partidosGanados || stats.partidosGanados,
        partidosPerdidos: body.datos.stats?.partidosPerdidos || stats.partidosPerdidos,
        torneosInscritos: body.datos.stats?.torneosInscritos || stats.torneosInscritos
      })
      setMessage('Perfil actualizado correctamente.')
    } catch (err) {
      setError('No se pudo conectar con el backend.')
    } finally {
      setSaving(false)
    }
  }

  console.log('Profile render - user:', user, 'loading:', loading, 'error:', error)

  if (loading) {
    console.log('Showing loading spinner')
    return (
      <div className="container py-5">
        <div className="text-center text-white">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('Showing access denied')
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card text-white bg-dark border-secondary shadow">
              <div className="card-body text-center">
                <h3 className="card-title mb-3">Acceso Denegado</h3>
                <p className="mb-3">Debes iniciar sesión para ver tu perfil.</p>
                <a href="/auth" className="btn btn-primary">Iniciar Sesión</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('Showing profile content')

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-white mb-1">Mi Perfil</h2>
              <p className="text-white mb-0">Revisa tus estadísticas y actualiza tu información personal.</p>
            </div>
            <span className="badge bg-warning text-dark py-2 px-3">Jugador</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card bg-dark border-secondary shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-4">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                      <span className="fs-4">{user?.nombre?.charAt(0) || 'J'}</span>
                    </div>
                    <div className="ms-3">
                      <h5 className="mb-1">{user?.nombre} {user?.apellido}</h5>
                      <p className="text-white mb-0">{user?.email}</p>
                    </div>
                  </div>

                  <div className="row gy-3">
                    <div className="col-12 mb-3">
                      <PuntosChart data={puntosHistory} />
                    </div>

                    <div className="col-6">
                      <div className="bg-secondary rounded-3 p-3 text-center">
                        <div className="text-white small">Torneos</div>
                        <div className="fs-4 fw-bold">{stats.torneosInscritos}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-secondary rounded-3 p-3 text-center">
                        <div className="text-white small">Jugados</div>
                        <div className="fs-4 fw-bold">{stats.partidosJugados}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-secondary rounded-3 p-3 text-center">
                        <div className="text-white small">Ganados</div>
                        <div className="fs-4 fw-bold">{stats.partidosGanados}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-secondary rounded-3 p-3 text-center">
                        <div className="text-white small">Perdidos</div>
                        <div className="fs-4 fw-bold">{stats.partidosPerdidos}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card bg-dark border-secondary shadow-sm h-100">
                <div className="card-body">
                  <h5 className="mb-3">Editar información</h5>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-white">Nombre</label>
                        <input
                          type="text"
                          name="nombre"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.nombre}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-white">Apellido</label>
                        <input
                          type="text"
                          name="apellido"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.apellido}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-white">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-white">Nacionalidad</label>
                        <input
                          type="text"
                          name="nacionalidad"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.nacionalidad}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-white">Contraseña nueva</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Dejar en blanco para mantener la contraseña actual"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary mt-4 w-100" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
