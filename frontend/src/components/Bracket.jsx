import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

function Bracket() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingMatchId, setEditingMatchId] = useState(null)

  const [form, setForm] = useState({
    resultado_jugador1: '',
    resultado_jugador2: '',
    ganador_id: null
  })

  useEffect(() => {
    fetchBracket()
  }, [id])

  const fetchBracket = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/api/torneos/${id}/bracket`, {
        credentials: 'include'
      })

      const data = await res.json()

      if (data.ok) {
        setMatches(data.datos)
      } else {
        setError(data.mensaje || 'Error cargando bracket')
      }

    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (match) => {
    setEditingMatchId(match.id)

    setForm({
      resultado_jugador1: match.resultado_jugador1 ?? '',
      resultado_jugador2: match.resultado_jugador2 ?? '',
      ganador_id: match.ganador_id ?? null
    })
  }

  const handleSave = async () => {
    try {
      const r1 = parseInt(form.resultado_jugador1)
      const r2 = parseInt(form.resultado_jugador2)

      if (isNaN(r1) || isNaN(r2) || !form.ganador_id) {
        setError('Completa todos los campos')
        return
      }

      const res = await fetch(
        `${API_URL}/api/torneos/partidos/${editingMatchId}/resultado`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            resultado_jugador1: r1,
            resultado_jugador2: r2,
            ganador_id: form.ganador_id
          })
        }
      )

      const data = await res.json()

      if (data.ok) {
        setEditingMatchId(null)
        fetchBracket()
      } else {
        setError(data.mensaje || 'Error guardando resultado')
      }

    } catch (err) {
      setError('Error de conexión')
    }
  }

  const currentMatch = matches.find(m => m.id === editingMatchId)

  const quarters = matches.filter(m => m.ronda === 1)
  const semis = matches.filter(m => m.ronda === 2)
  const final = matches.filter(m => m.ronda === 3)

  // 🟢 NUEVO: detectar si se puede finalizar
  const finalMatch = matches.find(m => m.ronda === 3)
  const canFinalize = finalMatch?.ganador_id

  // 🟢 NUEVO: llamada al backend
  const finalizeTournament = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/torneos/${id}/finalizar`,
        {
          method: 'POST',
          credentials: 'include'
        }
      )

      const data = await res.json()

      if (data.ok) {
        alert('🏆 Torneo finalizado correctamente')
        fetchBracket()
      } else {
        setError(data.mensaje || 'Error finalizando torneo')
      }

    } catch (err) {
      setError('Error de conexión')
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" />
        <p>Cargando bracket...</p>
      </div>
    )
  }

  return (
    <div className="container mt-5">

      <h2 className="text-center mb-4">Bracket del Torneo</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* 🧠 BRACKET VISUAL */}
      <div className="d-flex justify-content-between align-items-start mt-4">

        {/* CUARTOS */}
        <div className="d-flex flex-column gap-3">
          <h5 className="text-center">Cuartos</h5>

          {quarters.map(match => (
            <div key={match.id} className="card bg-dark text-white p-3" style={{ width: '220px' }}>

              <div className="text-center">
                {match.jugador1?.nombre || 'TBD'}
              </div>

              <div className="text-center text-warning">VS</div>

              <div className="text-center">
                {match.jugador2?.nombre || 'TBD'}
              </div>

              {match.ganador && (
                <div className="alert alert-success p-1 mt-2 text-center">
                  🏆 {match.ganador.nombre}
                </div>
              )}

              <button
                className="btn btn-warning btn-sm mt-2"
                onClick={() => handleEdit(match)}
              >
                Editar
              </button>

            </div>
          ))}
        </div>

        {/* LÍNEA */}
        <div className="d-flex align-items-center">
          <div style={{ width: '60px', borderTop: '2px solid white' }} />
        </div>

        {/* SEMIFINALES */}
        <div className="d-flex flex-column gap-5">
          <h5 className="text-center">Semifinales</h5>

          {semis.map(match => (
            <div key={match.id} className="card bg-dark text-white p-3" style={{ width: '220px' }}>

              <div className="text-center">
                {match.jugador1?.nombre || 'TBD'}
              </div>

              <div className="text-center text-warning">VS</div>

              <div className="text-center">
                {match.jugador2?.nombre || 'TBD'}
              </div>

              {match.ganador && (
                <div className="alert alert-success p-1 mt-2 text-center">
                  🏆 {match.ganador.nombre}
                </div>
              )}

              <button
                className="btn btn-warning btn-sm mt-2"
                onClick={() => handleEdit(match)}
              >
                Editar
              </button>

            </div>
          ))}
        </div>

        {/* LÍNEA */}
        <div className="d-flex align-items-center">
          <div style={{ width: '60px', borderTop: '2px solid white' }} />
        </div>

        {/* FINAL */}
        <div className="d-flex flex-column">
          <h5 className="text-center">Final</h5>

          {final.map(match => (
            <div key={match.id} className="card bg-warning text-dark p-3" style={{ width: '220px' }}>

              <div className="text-center">
                {match.jugador1?.nombre || 'TBD'}
              </div>

              <div className="text-center">VS</div>

              <div className="text-center">
                {match.jugador2?.nombre || 'TBD'}
              </div>

              {match.ganador && (
                <div className="alert alert-success p-1 mt-2 text-center">
                  🏆 {match.ganador.nombre}
                </div>
              )}

              <button
                className="btn btn-dark btn-sm mt-2"
                onClick={() => handleEdit(match)}
              >
                Editar
              </button>

            </div>
          ))}
        </div>

      </div>

      {/* 🏆 BOTÓN FINALIZAR TORNEO */}
      {canFinalize && (
        <div className="text-center mt-4">
          <button
            className="btn btn-success btn-lg"
            onClick={finalizeTournament}
          >
            🏆 Finalizar torneo
          </button>
        </div>
      )}

      {/* FORM */}
      {editingMatchId && currentMatch && (
        <div className="card p-3 mt-4">

          <h5>Editar resultado</h5>

          <input
            type="number"
            className="form-control mb-2"
            placeholder="Jugador 1"
            value={form.resultado_jugador1}
            onChange={(e) =>
              setForm({ ...form, resultado_jugador1: e.target.value })
            }
          />

          <input
            type="number"
            className="form-control mb-2"
            placeholder="Jugador 2"
            value={form.resultado_jugador2}
            onChange={(e) =>
              setForm({ ...form, resultado_jugador2: e.target.value })
            }
          />

          <div className="d-flex gap-2 mb-3">

            <button
              className="btn btn-outline-success w-50"
              onClick={() =>
                setForm({ ...form, ganador_id: currentMatch.jugador1_id })
              }
            >
              {currentMatch?.jugador1?.nombre} {currentMatch?.jugador1?.apellido}
            </button>

            <button
              className="btn btn-outline-success w-50"
              onClick={() =>
                setForm({ ...form, ganador_id: currentMatch.jugador2_id })
              }
            >
              {currentMatch?.jugador2?.nombre} {currentMatch?.jugador2?.apellido}
            </button>

          </div>

          <button className="btn btn-primary w-100 mb-2" onClick={handleSave}>
            Guardar resultado
          </button>

          <button
            className="btn btn-secondary w-100"
            onClick={() => setEditingMatchId(null)}
          >
            Cancelar
          </button>

        </div>
      )}

      <div className="text-center mt-4">
        <button
          className="btn btn-outline-light"
          onClick={() => navigate('/torneos')}
        >
          Volver
        </button>
      </div>

    </div>
  )
}

export default Bracket