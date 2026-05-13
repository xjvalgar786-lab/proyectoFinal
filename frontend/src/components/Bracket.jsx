import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

function Bracket() {
  const { id } = useParams()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBracket()
  }, [id])

  const fetchBracket = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/torneos/${id}/bracket`, {
        credentials: 'include'
      })
      const body = await res.json()

      if (body.ok && body.datos) {
        setMatches(body.datos)
      } else {
        setError(body.mensaje || 'Error cargando bracket')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getMatchesByRound = (round) => {
    return matches.filter(match => match.ronda === round)
  }

  const getRoundName = (round) => {
    switch (round) {
      case 1: return 'Cuartos de Final'
      case 2: return 'Semifinales'
      case 3: return 'Final'
      default: return `Ronda ${round}`
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando bracket...</span>
          </div>
          <p className="mt-2">Cargando bracket del torneo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="mb-4 text-center">
        <h2 className="text-danger" style={{ letterSpacing: '0.12rem' }}>Bracket del Torneo</h2>
        <p className="text-muted">Resultados de todos los enfrentamientos</p>
      </div>

      {matches.length === 0 ? (
        <div className="alert alert-info text-center">
          No hay partidos registrados para este torneo aún.
        </div>
      ) : (
        <div className="row">
          {[1, 2, 3].map(round => {
            const roundMatches = getMatchesByRound(round)
            return (
              <div key={round} className="col-md-4 mb-4">
                <div className="card bg-dark border-secondary h-100">
                  <div className="card-header text-center">
                    <h5 className="text-warning mb-0">{getRoundName(round)}</h5>
                  </div>
                  <div className="card-body">
                    {roundMatches.map((match, index) => (
                      <div key={match.id} className="mb-3 p-3 border rounded" style={{ backgroundColor: '#2a2a2a' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className={`flex-fill text-center p-3 rounded position-relative ${
                            match.ganador_id === match.jugador1_id ? 'bg-success text-white border border-warning' : 'bg-secondary text-light'
                          }`}>
                            <strong className="d-block fs-5">{match.jugador1?.nombre} {match.jugador1?.apellido}</strong>
                            <div className="mt-2">
                              <span className="badge bg-dark fs-6 px-3 py-2">{match.resultado_jugador1} sets</span>
                            </div>
                            {match.ganador_id === match.jugador1_id && (
                              <div className="position-absolute top-0 end-0 mt-1 me-2">
                                <span className="badge bg-warning text-dark fs-6 px-2 py-1">🏆 GANADOR</span>
                              </div>
                            )}
                          </div>
                          <div className="mx-3 text-warning fw-bold fs-4">VS</div>
                          <div className={`flex-fill text-center p-3 rounded position-relative ${
                            match.ganador_id === match.jugador2_id ? 'bg-success text-white border border-warning' : 'bg-secondary text-light'
                          }`}>
                            <strong className="d-block fs-5">{match.jugador2?.nombre} {match.jugador2?.apellido}</strong>
                            <div className="mt-2">
                              <span className="badge bg-dark fs-6 px-3 py-2">{match.resultado_jugador2} sets</span>
                            </div>
                            {match.ganador_id === match.jugador2_id && (
                              <div className="position-absolute top-0 end-0 mt-1 me-2">
                                <span className="badge bg-warning text-dark fs-6 px-2 py-1">🏆 GANADOR</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="alert alert-warning py-2 mb-0">
                            <strong className="text-dark">Resultado Final: {match.resultado_jugador1} - {match.resultado_jugador2}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="text-center mt-4">
        <button 
          className="btn btn-outline-light"
          onClick={() => window.history.back()}
        >
          ← Volver
        </button>
      </div>
    </div>
  )
}

export default Bracket