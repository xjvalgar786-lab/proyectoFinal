import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Education.css';

function Education() {
  const { user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [archivedVideos, setArchivedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    url: '',
    dificultad: 'facil',
    duracion: ''
  });

  // Cargar videos al montar
  useEffect(() => {
    fetchVideos();
    if (user?.rol === 'administrador') {
      fetchArchivedVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      const response = await fetch('https://mysql-production-afe3.up.railway.app/api/videos-publicas');
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedVideos = async () => {
    try {
      const response = await fetch('https://mysql-production-afe3.up.railway.app/api/videos/archivados/todos', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setArchivedVideos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar videos archivados:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? 'https://mysql-production-afe3.up.railway.app/api/videos/${editingId}'
        : 'https://mysql-production-afe3.up.railway.app/api/videos';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al guardar video');
      
      await fetchVideos();
      setFormData({ titulo: '', descripcion: '', url: '', dificultad: 'facil', duracion: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el video');
    }
  };

  const handleEdit = (video) => {
    setFormData({
      titulo: video.titulo,
      descripcion: video.descripcion,
      url: video.url,
      dificultad: video.dificultad,
      duracion: video.duracion
    });
    setEditingId(video.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que quiere archivar este video?')) {
      try {
        const response = await fetch(`https://mysql-production-afe3.up.railway.app/api/videos/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al archivar video');
        
        await fetchVideos();
        await fetchArchivedVideos();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al archivar el video');
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('¿Está seguro de que quiere archivar este video?')) {
      try {
        const response = await fetch(`https://mysql-production-afe3.up.railway.app/api/videos/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al archivar video');
        
        await fetchVideos();
        await fetchArchivedVideos();
        alert('Video archivado correctamente');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al archivar el video');
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('¿Está seguro de que quiere restaurar este video como publicado?')) {
      try {
        const response = await fetch(`https://mysql-production-afe3.up.railway.app/api/videos/${id}/restore`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ estado: 'publicado' })
        });

        if (!response.ok) throw new Error('Error al restaurar video');
        
        await fetchVideos();
        await fetchArchivedVideos();
        alert('Video restaurado correctamente');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al restaurar el video');
      }
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm('⚠️ ¿Está seguro de que quiere ELIMINAR PERMANENTEMENTE este video de la base de datos? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`https://mysql-production-afe3.up.railway.app/api/videos/${id}/permanent`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar video');
        
        await fetchArchivedVideos();
        alert('Video eliminado permanentemente');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el video');
      }
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', url: '', dificultad: 'facil', duracion: '' });
  };

  // Función para convertir URL de YouTube a formato embed
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    
    // Si ya es un URL embed, devolverlo tal cual
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Convertir youtube.com/watch?v=ID
    const watchMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    // Convertir youtu.be/ID
    const shortMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }
    
    // Si no es YouTube, devolverlo como está
    return url;
  };

  const videosPorDificultad = {
    facil: videos.filter(v => v.dificultad === 'facil'),
    medio: videos.filter(v => v.dificultad === 'medio'),
    dificil: videos.filter(v => v.dificultad === 'dificil')
  };

  const niveles = [
    { id: 'facil', nombre: 'Fácil', color: '#28a745' },
    { id: 'medio', nombre: 'Medio', color: '#ffc107' },
    { id: 'dificil', nombre: 'Difícil', color: '#dc3545' }
  ];

  if (loading) return <div className="container mt-5"><p>Cargando videos...</p></div>;

  return (
    <div className="education-container mt-3" style={{ marginBottom: 0, paddingBottom: 0, minHeight: 'auto' }}>
      <div className="container" style={{ marginBottom: 0, paddingBottom: 0 }}>
        <div className="education-header mb-3">
          <h1 className="education-title">Centro Didáctico</h1>
          <p className="education-subtitle">Aprende técnicas de tenis de mesa con nuestros videos</p>
        </div>

        {/* Botón para crear video (solo admins) */}
        {user?.rol === 'administrador' && (
          <div className="admin-actions mb-4">
            <button 
              className="btn btn-success btn-lg"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : '+ Crear Nuevo Video'}
            </button>
          </div>
        )}

        {/* Formulario para crear/editar video */}
        {showForm && user?.rol === 'administrador' && (
          <div className="form-container mb-3">
            <h3 className="form-title">{editingId ? 'Editar Video' : 'Crear Nuevo Video'}</h3>
            <form onSubmit={handleSubmit} className="video-form">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Título *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Servicio de golpe cortado"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Dificultad *</label>
                  <select
                    className="form-control"
                    name="dificultad"
                    value={formData.dificultad}
                    onChange={handleInputChange}
                  >
                    <option value="facil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">URL del Video *</label>
                  <input
                    type="url"
                    className="form-control"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                    placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                  />
                  <small className="text-muted d-block mt-1">
                    Acepta URL normales de YouTube o en formato embed
                  </small>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Duración (segundos)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    placeholder="300"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe el contenido del video..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar Video' : 'Crear Video'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={cancelEdit}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Videos organizados por dificultad */}
        <div className="videos-section">
          {niveles.map(nivel => (
            <div key={nivel.id} className="dificultad-section mb-3">
              <div className="dificultad-header" style={{ borderLeftColor: nivel.color }}>
                <h2 className="dificultad-title">
                  {nivel.nombre} 
                  <span className="badge" style={{ backgroundColor: nivel.color }}>
                    {videosPorDificultad[nivel.id].length}
                  </span>
                </h2>
              </div>

              {videosPorDificultad[nivel.id].length === 0 ? (
                <p className="text-muted">No hay videos disponibles en este nivel</p>
              ) : (
                <div className="row">
                  {videosPorDificultad[nivel.id].map(video => (
                    <div key={video.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="video-card">
                        <div className="video-thumbnail">
                          {video.url && video.url.includes('youtube') ? (
                            <iframe
                              width="100%"
                              height="180"
                              src={convertToEmbedUrl(video.url)}
                              title={video.titulo}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="video-placeholder">
                              <p>Video</p>
                            </div>
                          )}
                        </div>
                        <div className="video-body">
                          <h5 className="video-title">{video.titulo}</h5>
                          <p className="video-description">{video.descripcion}</p>
                          <div className="video-meta">
                            {video.duracion && (
                              <span className="badge bg-info">
                                {Math.floor(video.duracion / 60)}:{String(video.duracion % 60).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          <p className="video-autor">
                            Por: {video.autor?.nombre} {video.autor?.apellido}
                          </p>
                          
                          {user?.rol === 'administrador' && (
                            <div className="video-actions">
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleEdit(video)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleArchive(video.id)}
                              >
                                Archivar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sección de videos archivados (solo para admins) */}
        {user?.rol === 'administrador' && (
          <div className="archived-section mt-3 pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                <span style={{ color: '#6c757d' }}>Videos Archivados</span>
                <span className="badge bg-secondary ms-2">{archivedVideos.length}</span>
              </h2>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? '▼ Ocultar' : '▶ Mostrar'}
              </button>
            </div>

            {showArchived && (
              <>
                {archivedVideos.length === 0 ? (
                  <p className="text-muted">No hay videos archivados</p>
                ) : (
                  <div className="row">
                    {archivedVideos.map(video => (
                      <div key={video.id} className="col-md-6 col-lg-4 mb-4">
                        <div className="video-card" style={{ opacity: 0.7, border: '2px dashed #6c757d' }}>
                          <div className="video-thumbnail">
                            <div style={{ position: 'relative' }}>
                              {video.url && video.url.includes('youtube') ? (
                                <iframe
                                  width="100%"
                                  height="180"
                                  src={convertToEmbedUrl(video.url)}
                                  title={video.titulo}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ opacity: 0.5 }}
                                ></iframe>
                              ) : (
                                <div className="video-placeholder">
                                  <p>Video Archivado</p>
                                </div>
                              )}
                              <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#6c757d',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                ARCHIVADO
                              </div>
                            </div>
                          </div>
                          <div className="video-body">
                            <h5 className="video-title">{video.titulo}</h5>
                            <p className="video-description">{video.descripcion}</p>
                            <div className="video-meta">
                              {video.duracion && (
                                <span className="badge bg-info">
                                  {Math.floor(video.duracion / 60)}:{String(video.duracion % 60).padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <p className="video-autor">
                              Por: {video.autor?.nombre} {video.autor?.apellido}
                            </p>
                            
                            <div className="video-actions d-flex gap-2 flex-column">
                              <button
                                className="btn btn-sm btn-success w-100"
                                onClick={() => handleRestore(video.id)}
                              >
                                ♻️ Restaurar
                              </button>
                              <button
                                className="btn btn-sm btn-danger w-100"
                                onClick={() => handlePermanentDelete(video.id)}
                              >
                                🗑️ Eliminar Permanentemente
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Education;
