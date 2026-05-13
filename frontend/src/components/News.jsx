import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000'
const PAGE_SIZE = 5

function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        setError('')

        const [newsRes, tournamentsRes, rankingRes] = await Promise.all([
          fetch(`${API_URL}/api/noticias-publicas/publicadas`),
          fetch(`${API_URL}/api/torneos-publicos/disponibles`),
          fetch(`${API_URL}/api/rankings/jugadores?page=1`)
        ])

        const newsBody = await newsRes.json()
        const tournamentsBody = await tournamentsRes.json()
        const rankingBody = await rankingRes.json()

        const dynamicNews = []

        if (tournamentsBody.ok && Array.isArray(tournamentsBody.datos) && tournamentsBody.datos.length > 0) {
          const upcomingTournaments = [...tournamentsBody.datos].sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))

          upcomingTournaments.forEach((tournament, index) => {
            const startDate = new Date(tournament.fecha_inicio).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })
            const subtitle = tournament.descripcion
              ? `Sede: ${tournament.sede || 'pendiente'} · ${tournament.descripcion}`
              : 'Consulta todos los detalles en la sección de torneos.'

            dynamicNews.push({
              id: `tournament-${tournament.id}-${index}`,
              title: `Evento: ${tournament.nombre}`,
              content: `Arranca el ${startDate}. ${subtitle}`,
              tag: 'Torneo'
            })
          })
        }

        if (rankingBody.ok && rankingBody.datos && Array.isArray(rankingBody.datos.players) && rankingBody.datos.players.length > 0) {
          const topPlayer = rankingBody.datos.players[0]
          dynamicNews.push({
            id: 'top-player',
            title: `Ranking en movimiento`,
            content: `${topPlayer.nombre} ${topPlayer.apellido} encabeza la tabla con ${topPlayer.puntos} puntos. ¡Un favorito a seguir!`,
            tag: 'Ranking'
          })
        }

        const publishedNews = newsBody.ok && Array.isArray(newsBody.datos)
          ? newsBody.datos.map(item => ({
              id: `published-${item.id}`,
              title: item.titulo,
              content: item.contenido.length > 120
                ? `${item.contenido.slice(0, 117).trim()}...`
                : item.contenido,
              tag: 'Noticia'
            }))
          : []

        setNews([...dynamicNews, ...publishedNews])
        setPage(0)
      } catch (err) {
        console.error('Error cargando noticias:', err)
        setError('No se pudieron cargar las noticias. Intenta nuevamente más tarde.')
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE))
  const pageNews = news.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const cardStyle = tag => ({
    borderRadius: '1.25rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: tag === 'Torneo'
      ? 'linear-gradient(180deg, rgba(18, 26, 44, 0.96), rgba(12, 22, 40, 0.98))'
      : tag === 'Ranking'
        ? 'linear-gradient(180deg, rgba(24, 16, 42, 0.96), rgba(14, 12, 38, 0.98))'
        : 'linear-gradient(180deg, rgba(42, 18, 12, 0.96), rgba(38, 14, 14, 0.98))',
    color: '#f8f9fa',
    boxShadow: '0 18px 36px rgba(0, 0, 0, 0.22)',
    minHeight: '170px'
  })

  const badgeStyle = {
    display: 'inline-block',
    padding: '0.35rem 0.95rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '0.85rem',
    opacity: 0.95,
    letterSpacing: '0.04em',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)'
  }

  const tagStyles = {
    Torneo: { ...badgeStyle, backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#e5f1ff' },
    Ranking: { ...badgeStyle, backgroundColor: 'rgba(255, 255, 255, 0.16)', color: '#f1e8ff' },
    Noticia: { ...badgeStyle, backgroundColor: 'rgba(255, 255, 255, 0.16)', color: '#fff4e0' }
  }

  const buttonStyle = {
    minWidth: '120px',
    borderRadius: '999px',
    padding: '0.75rem 1.2rem',
    fontWeight: 700,
    letterSpacing: '0.03em'
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="mb-4 text-center">
        <h2 className="text-danger" style={{ letterSpacing: '0.12rem' }}>Noticias y Eventos</h2>
      </div>

      {loading && <p className="text-center">Cargando noticias...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && news.length === 0 && (
        <div className="alert alert-info">No hay noticias disponibles por el momento.</div>
      )}

      {!loading && !error && news.length > 0 && (
        <>
          <div className="row">
            {pageNews.map(item => (
              <div key={item.id} className="col-12 mb-4">
                <div className="card h-100" style={cardStyle(item.tag)}>
                  <div className="card-body">
                    {item.tag && <span style={tagStyles[item.tag] || badgeStyle}>{item.tag}</span>}
                    <h5 className="card-title" style={{ fontWeight: 800, letterSpacing: '0.03em', marginBottom: '0.9rem' }}>{item.title}</h5>
                    <p className="card-text" style={{ color: 'rgba(248, 249, 250, 0.92)', lineHeight: '1.75' }}>{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center flex-column flex-md-row gap-3">
            <button
              type="button"
              className="btn btn-outline-light"
              style={buttonStyle}
              disabled={page === 0}
              onClick={() => setPage(prev => Math.max(prev - 1, 0))}
            >
              ← Cinco anteriores
            </button>

            <div className="text-white-50">
              Página {page + 1} de {totalPages}
            </div>

            <button
              type="button"
              className="btn btn-light"
              style={buttonStyle}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
            >
              Cinco siguientes →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default News