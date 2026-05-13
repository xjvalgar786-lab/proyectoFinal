import React, { useState, useEffect } from 'react'

function Ranking() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchRanking(currentPage)
  }, [currentPage])

  const fetchRanking = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/rankings/jugadores?page=${page}`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }
      const data = await response.json()
      if (data.ok && data.datos) {
        setPlayers(data.datos.players)
        setPagination(data.datos.pagination)
      } else {
        setError('Error al cargar el ranking')
      }
    } catch (error) {
      console.error('Error al cargar ranking:', error)
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Cargando ranking...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="mb-4 text-center">
        <h2 className="text-danger" style={{ letterSpacing: '0.12rem' }}>Ranking de Jugadores</h2>
      </div>
      
      {pagination && (
        <div className="d-flex justify-content-center align-items-center mb-4">
          <small className="text-muted" style={{ fontSize: '0.9rem' }}>
            Página {pagination.currentPage} de {pagination.totalPages} 
            ({pagination.totalPlayers} jugadores totales)
          </small>
        </div>
      )}

      {players.length === 0 ? (
        <p className="text-center text-muted">No hay jugadores registrados</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover" style={{
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            background: 'linear-gradient(180deg, rgba(33,37,41,0.98), rgba(15,18,22,0.95))',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <thead style={{
              background: 'linear-gradient(135deg, #dc3545, #b02a37)',
              color: '#fff'
            }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>Posición</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>Nombre</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>Apellido</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>Puntos</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>Nacionalidad</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const globalPosition = (pagination.currentPage - 1) * 10 + index + 1;
                const isTopThree = globalPosition <= 3;
                return (
                  <tr key={player.id} style={{
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.2s ease',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontWeight: isTopThree ? 800 : 600,
                      color: isTopThree ? '#dc3545' : '#f8f9fa',
                      fontSize: isTopThree ? '1.1rem' : '1rem'
                    }}>
                      {globalPosition === 1 && '🥇'}
                      {globalPosition === 2 && '🥈'}
                      {globalPosition === 3 && '🥉'}
                      {globalPosition > 3 && globalPosition}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{player.nombre}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{player.apellido}</td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontWeight: 700,
                      color: '#ffc107',
                      fontSize: '1.05rem'
                    }}>
                      {player.puntos}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#adb5bd' }}>{player.nacionalidad || 'No especificada'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <div className="d-flex gap-3 align-items-center">
            <button 
              className="btn btn-outline-light"
              style={{
                borderRadius: '999px',
                padding: '0.75rem 1.5rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                transition: 'all 0.2s ease'
              }}
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage}
            >
              ← Anterior
            </button>
            <span className="text-white-50" style={{ fontSize: '0.95rem' }}>
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <button 
              className="btn btn-light"
              style={{
                borderRadius: '999px',
                padding: '0.75rem 1.5rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                transition: 'all 0.2s ease'
              }}
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ranking