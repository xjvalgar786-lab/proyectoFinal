import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const API_URL = 'https://backend-production-966f2.up.railway.app'

function Tournaments() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useContext(AuthContext)
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newTournament, setNewTournament] = useState({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingData, setEditingData] = useState({})
  const [expandedTournament, setExpandedTournament] = useState(null)
  const [inscritos, setInscritos] = useState({})
  const [userInscriptions, setUserInscriptions] = useState({}) // Cambiar a objeto con id de inscripción

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/auth')
    }
  }, [user, userLoading, navigate])

  // Cargar torneos al montar el componente
  useEffect(() => {
    if (user) {
      fetchTournaments()
      fetchUserInscriptions()
    }
  }, [user])

  // Cargar inscritos automáticamente para verificar si hay 8 y mostrar botón de simular
  useEffect(() => {
    if (tournaments.length > 0 && user && user.rol === 'administrador') {
      tournaments.forEach(tournament => {
        if (tournament.estado === 'abierto' && !inscritos[tournament.id]) {
          fetchInscritos(tournament.id)
        }
      })
    }
  }, [tournaments, user])

  const fetchUserInscriptions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inscripciones/usuario/${user.id}`, {
        credentials: 'include'
      })
      const body = await res.json()
      if (body.ok && body.datos) {
        const inscriptionsMap = {}
        body.datos.forEach(i => {
          inscriptionsMap[i.torneo_id] = i.id // Guardar el ID de la inscripción con el ID del torneo como clave
        })
        setUserInscriptions(inscriptionsMap)
      }
    } catch (err) {
      console.error('Error cargando inscripciones del usuario:', err)
    }
  }

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      setError('')
      
      let url = `${API_URL}/api/torneos-publicos/disponibles`
      let options = { credentials: 'include' }
      
      // Si es admin, traer todos los torneos
      if (user && user.rol === 'administrador') {
        url = `${API_URL}/api/torneos/`
        options = { 
          method: 'GET',
          credentials: 'include'
        }
      }

      const res = await fetch(url, options)
      const body = await res.json()

      if (body.ok && body.datos) {
        setTournaments(body.datos)
      } else {
        setError(body.mensaje || 'Error cargando torneos')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchInscritos = async (torneoId) => {
    try {
      const res = await fetch(`${API_URL}/api/inscripciones/torneo/${torneoId}`, {
        credentials: 'include'
      })
      const body = await res.json()
      if (body.ok && body.datos) {
        setInscritos({...inscritos, [torneoId]: body.datos})
      }
    } catch (err) {
      console.error('Error cargando inscritos:', err)
    }
  }

  const handleInscribirse = async (torneoId) => {
    try {
      const res = await fetch(`${API_URL}/api/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usuario_id: user.id, torneo_id: torneoId })
      })
      const body = await res.json()

      if (body.ok) {
        setSuccess('¡Inscripción exitosa!')
        setUserInscriptions({...userInscriptions, [torneoId]: body.datos.id})
        fetchInscritos(torneoId)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(body.mensaje || 'Error inscribiéndose')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    }
  }

  const handleDesuscribirse = async (torneoId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar tu inscripción?')) {
      try {
        const inscripcionId = userInscriptions[torneoId]
        const res = await fetch(`${API_URL}/api/inscripciones/${inscripcionId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        const body = await res.json()

        if (body.ok) {
          setSuccess('Inscripción cancelada')
          const newInscriptions = {...userInscriptions}
          delete newInscriptions[torneoId]
          setUserInscriptions(newInscriptions)
          fetchInscritos(torneoId)
          setTimeout(() => setSuccess(''), 3000)
        } else {
          setError(body.mensaje || 'Error cancelando inscripción')
        }
      } catch (err) {
        setError('No se pudo conectar con el servidor')
        console.error(err)
      }
    }
  }

  const handleCreateTournament = async (e) => {
    e.preventDefault()
    if (!newTournament.nombre || !newTournament.fecha_inicio || !newTournament.fecha_fin) {
      setError('Completa todos los campos requeridos')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/torneos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTournament)
      })
      const body = await res.json()

      if (body.ok) {
        setSuccess('Torneo creado exitosamente')
        setNewTournament({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })
        await fetchTournaments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(body.mensaje || 'Error creando torneo')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    }
  }

  const handleUpdateTournament = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/torneos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingData)
      })
      const body = await res.json()

      if (body.ok) {
        setEditingId(null)
        setEditingData({})
        setSuccess('Torneo actualizado')
        await fetchTournaments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(body.mensaje || 'Error actualizando torneo')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    }
  }

  const handleDeleteTournament = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este torneo?')) {
      try {
        const res = await fetch(`${API_URL}/api/torneos/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        const body = await res.json()

        if (body.ok) {
          await fetchTournaments()
        } else {
          setError(body.mensaje || 'Error eliminando torneo')
        }
      } catch (err) {
        setError('No se pudo conectar con el servidor')
        console.error(err)
      }
    }
  }

  const handleSimulateTournament = async (tournamentId) => {
    if (window.confirm('¿Estás seguro de que quieres generar el bracket? Podrás ingresar los resultados manualmente.')) {
      try {
        const res = await fetch(`${API_URL}/api/torneos/${tournamentId}/generar-bracket`, {
          method: 'POST',
          credentials: 'include'
        })
        const body = await res.json()

        if (body.ok) {
          setSuccess('Bracket generado. Ahora ingresa los resultados manualmente.')
          await fetchTournaments()
          setTimeout(() => setSuccess(''), 5000)
          // Redirigir al bracket para ingresar resultados
          navigate(`/torneos/${tournamentId}/bracket`)
        } else {
          setError(body.mensaje || 'Error generando bracket')
        }
      } catch (err) {
        setError('No se pudo conectar con el servidor')
        console.error(err)
      }
    }
  }

  const inputStyle = { backgroundColor: '#222', color: '#fff', borderColor: '#555' }
  
  // Estilos de tipografía mejorados
  const titleStyle = { 
    fontSize: '2.5rem', 
    fontWeight: 'bold', 
    letterSpacing: '0.5px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  }
  const subtitleStyle = { 
    fontSize: '1.5rem', 
    fontWeight: '600', 
    letterSpacing: '0.3px',
    marginBottom: '1.5rem'
  }
  const cardTitleStyle = { 
    fontSize: '1.3rem', 
    fontWeight: '700', 
    letterSpacing: '0.2px',
    color: '#fff',
    lineHeight: '1.4'
  }
  const labelStyle = { 
    fontSize: '0.95rem', 
    fontWeight: '600', 
    letterSpacing: '0.1px'
  }
  const descriptionStyle = {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#e0e0e0'
  }
  const dateStyle = {
    fontSize: '0.9rem',
    color: '#b0b0b0',
    lineHeight: '1.5'
  }

  return (
    <div className="container mt-5">
      <h2 className="text-danger" style={titleStyle}>Torneos</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        {/* FORMULARIO DE CREAR TORNEO - SOLO ADMIN */}
        {user && user.rol === 'administrador' && (
          <div className="col-md-6 mb-4">
            <div className="card bg-dark border-secondary">
              <div className="card-body">
                <h3 className="card-title text-success" style={subtitleStyle}>Crear Torneo</h3>
                <form onSubmit={handleCreateTournament}>
                  <div className="mb-3">
                    <label className="form-label text-white" style={labelStyle}>Nombre *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={inputStyle}
                      placeholder="Nombre del torneo" 
                      value={newTournament.nombre} 
                      onChange={(e) => setNewTournament({...newTournament, nombre: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white" style={labelStyle}>Descripción</label>
                    <textarea 
                      className="form-control" 
                      style={inputStyle}
                      placeholder="Descripción (opcional)" 
                      value={newTournament.descripcion} 
                      onChange={(e) => setNewTournament({...newTournament, descripcion: e.target.value})}
                      rows="3"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white" style={labelStyle}>Fecha Inicio *</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        style={inputStyle}
                        value={newTournament.fecha_inicio} 
                        onChange={(e) => setNewTournament({...newTournament, fecha_inicio: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white" style={labelStyle}>Fecha Fin *</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        style={inputStyle}
                        value={newTournament.fecha_fin} 
                        onChange={(e) => setNewTournament({...newTournament, fecha_fin: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success w-100">Crear Torneo</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* LISTA DE TORNEOS */}
        <div className={user && user.rol === 'administrador' ? 'col-md-6' : 'col-md-12'}>
          <h3 className="text-info mb-3" style={subtitleStyle}>Lista de Torneos</h3>
          
          {loading && <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>}

          {!loading && tournaments.length === 0 && (
            <div className="alert alert-info">No hay torneos disponibles</div>
          )}

          {!loading && tournaments.map(tournament => (
            <div key={tournament.id} className="card mb-3 bg-dark border-secondary">
              <div className="card-body">
                {editingId === tournament.id ? (
                  <>
                    <input 
                      type="text" 
                      className="form-control mb-2" 
                      style={inputStyle}
                      value={editingData.nombre}
                      onChange={(e) => setEditingData({...editingData, nombre: e.target.value})}
                    />
                    <textarea 
                      className="form-control mb-2" 
                      style={inputStyle}
                      value={editingData.descripcion} 
                      onChange={(e) => setEditingData({...editingData, descripcion: e.target.value})}
                      rows="2"
                    />
                    <div className="row mb-2">
                      <div className="col-6">
                        <input 
                          type="date" 
                          className="form-control" 
                          style={inputStyle}
                          value={editingData.fecha_inicio} 
                          onChange={(e) => setEditingData({...editingData, fecha_inicio: e.target.value})}
                        />
                      </div>
                      <div className="col-6">
                        <input 
                          type="date" 
                          className="form-control" 
                          style={inputStyle}
                          value={editingData.fecha_fin}
                          onChange={(e) => setEditingData({...editingData, fecha_fin: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="btn-group w-100" role="group">
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateTournament(tournament.id)}
                      >
                        Guardar
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h5 className="card-title text-white" style={cardTitleStyle}>{tournament.nombre}</h5>
                    {tournament.descripcion && <p className="card-text text-light" style={descriptionStyle}>{tournament.descripcion}</p>}
                    <p className="card-text text-light" style={dateStyle}>
                      <small>
                        Inicio: {new Date(tournament.fecha_inicio).toLocaleDateString('es-ES')} | 
                        Fin: {new Date(tournament.fecha_fin).toLocaleDateString('es-ES')}
                      </small>
                    </p>
                    <p className="card-text">
                      <span className="badge" style={{backgroundColor: tournament.estado === 'abierto' ? '#198754' : tournament.estado === 'en_curso' ? '#0d6efd' : '#6c757d', color: '#fff'}}>
                        {tournament.estado}
                      </span>
                    </p>
                    <div className="btn-group w-100 mb-3" role="group">
                      {user && user.rol === 'administrador' ? (
                        <>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => startEdit(tournament)}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteTournament(tournament.id)}
                          >
                            Eliminar
                          </button>
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              setExpandedTournament(expandedTournament === tournament.id ? null : tournament.id)
                              if (expandedTournament !== tournament.id) {
                                fetchInscritos(tournament.id)
                              }
                            }}
                          >
                            {expandedTournament === tournament.id ? 'Ocultar' : 'Ver'} Inscritos
                          </button>
                          {inscritos[tournament.id] && inscritos[tournament.id].length === 8 && tournament.estado === 'abierto' && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSimulateTournament(tournament.id)}
                            >
                              Generar Bracket
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button 
                            className={`btn btn-sm ${userInscriptions[tournament.id] ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => {
                              if (userInscriptions[tournament.id]) {
                                handleDesuscribirse(tournament.id)
                              } else {
                                handleInscribirse(tournament.id)
                              }
                            }}
                          >
                            {userInscriptions[tournament.id] ? 'Cancelar Inscripción' : 'Inscribirse'}
                          </button>
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              setExpandedTournament(expandedTournament === tournament.id ? null : tournament.id)
                              if (expandedTournament !== tournament.id) {
                                fetchInscritos(tournament.id)
                              }
                            }}
                          >
                            {expandedTournament === tournament.id ? 'Ocultar' : 'Ver'} Inscritos
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Vista previa de inscritos (antes de expandir) */}
                    {expandedTournament !== tournament.id && inscritos[tournament.id] && inscritos[tournament.id].length > 0 && (
                      <div className="mt-2" style={{paddingTop: '0.8rem', borderTop: '1px solid #444'}}>
                        <small className="text-info" style={{fontSize: '0.85rem', fontWeight: '600'}}>
                          Inscritos: 
                          {inscritos[tournament.id].slice(0, 3).map((insc, i) => (
                            <span key={i} style={{marginLeft: '0.5rem', color: '#fff', fontWeight: '600'}}>
                              {insc.usuario?.nombre}
                              {i < Math.min(2, inscritos[tournament.id].length - 1) && ', '}
                            </span>
                          ))}
                          {inscritos[tournament.id].length > 3 && 
                            <span style={{marginLeft: '0.5rem', color: '#0d6efd', fontWeight: '600'}}>
                              +{inscritos[tournament.id].length - 3} más
                            </span>
                          }
                        </small>
                      </div>
                    )}
                    
                    {/* Sección de inscritos expandida */}
                    {expandedTournament === tournament.id && (
                      <div className="alert alert-info mt-3" style={{backgroundColor: '#1a3a3a', borderColor: '#0d6efd'}}>
                        <h6 className="text-white mb-3" style={{fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.2px'}}>
                          Jugadores Inscritos ({inscritos[tournament.id]?.length || 0})
                        </h6>
                        {inscritos[tournament.id] && inscritos[tournament.id].length > 0 ? (
                          <div style={{display: 'grid', gap: '0.8rem'}}>
                            {inscritos[tournament.id].map((inscripcion, idx) => (
                              <div 
                                key={idx} 
                                style={{
                                  backgroundColor: '#2a2a2a',
                                  padding: '0.8rem',
                                  borderRadius: '0.4rem',
                                  borderLeft: '4px solid #0d6efd',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <div>
                                  <span style={{color: '#4dd0ff', fontWeight: '700', fontSize: '1rem'}}>#{idx + 1}</span>
                                  <span style={{color: '#fff', fontWeight: '700', fontSize: '1.05rem', marginLeft: '1rem'}}>
                                    {inscripcion.usuario?.nombre} {inscripcion.usuario?.apellido}
                                  </span>
                                </div>
                                <span className="badge bg-success" style={{fontSize: '0.85rem', padding: '0.4rem 0.6rem'}}>
                                  {inscripcion.estado}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-light mb-0" style={{fontSize: '0.95rem', color: '#b0b0b0'}}>No hay jugadores inscritos aún</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Tournaments