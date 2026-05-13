const { Op } = require('sequelize');
const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");

// Admin: Obtener todos los videos
exports.getAllVideos = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const allVideos = await videos.findAll({
      where: {
        estado: { [Op.ne]: 'archivado' }
      },
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(allVideos);
  } catch (error) {
    console.error('Error en getAllVideos:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// Admin: Obtener videos por dificultad (para administración)
exports.getVideosByDificultad = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const { dificultad } = req.params;
    const videosList = await videos.findAll({
      where: { 
        dificultad,
        estado: { [Op.ne]: 'archivado' }
      },
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(videosList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Crear video
exports.createVideo = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const { titulo, descripcion, url, dificultad, duracion } = req.body;
    const autor_id = req.user.id;

    if (!titulo || !url || !dificultad) {
      return res.status(400).json({ error: 'Título, URL y dificultad son requeridos' });
    }

    const nuevoVideo = await videos.create({
      titulo,
      descripcion,
      url,
      dificultad,
      duracion,
      autor_id,
      estado: 'publicado'
    });

    const videoConAutor = await videos.findByPk(nuevoVideo.id, {
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.status(201).json(videoConAutor);
  } catch (error) {
    console.error('Error en createVideo:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// Admin: Actualizar video
exports.updateVideo = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const { id } = req.params;
    const { titulo, descripcion, url, dificultad, duracion, estado } = req.body;

    const video = await videos.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    await video.update({
      titulo: titulo || video.titulo,
      descripcion: descripcion || video.descripcion,
      url: url || video.url,
      dificultad: dificultad || video.dificultad,
      duracion: duracion || video.duracion,
      estado: estado || video.estado
    });

    const videoActualizado = await videos.findByPk(id, {
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.json(videoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Eliminar video (soft delete)
exports.deleteVideo = async (req, res) => {
  try {
    const { videos } = initModels(sequelize);
    const { id } = req.params;

    const video = await videos.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    await video.update({ estado: 'archivado' });
    res.json({ mensaje: 'Video archivado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Restaurar video (desarchitar)
exports.restoreVideo = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const { id } = req.params;
    const { estado } = req.body;

    const video = await videos.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    if (video.estado !== 'archivado') {
      return res.status(400).json({ error: 'El video no está archivado' });
    }

    const nuevoEstado = estado || 'publicado';
    await video.update({ estado: nuevoEstado });

    const videoRestaurado = await videos.findByPk(id, {
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.json({ 
      mensaje: `Video restaurado correctamente con estado: ${nuevoEstado}`,
      video: videoRestaurado 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Obtener videos archivados
exports.getArchivedVideos = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const archivedVideos = await videos.findAll({
      where: {
        estado: 'archivado'
      },
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(archivedVideos);
  } catch (error) {
    console.error('Error en getArchivedVideos:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// Admin: Eliminar video permanentemente (hard delete)
exports.permanentDeleteVideo = async (req, res) => {
  try {
    const { videos } = initModels(sequelize);
    const { id } = req.params;

    const video = await videos.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    await video.destroy();
    res.json({ mensaje: 'Video eliminado permanentemente de la base de datos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Público: Obtener videos publicados por dificultad
exports.getVideosByDificultadPublico = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const { dificultad } = req.params;
    const videosList = await videos.findAll({
      where: { 
        dificultad,
        estado: 'publicado'
      },
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(videosList);
  } catch (error) {
    console.error('Error en getVideosByDificultadPublico:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// Público: Obtener todos los videos publicados
exports.getAllVideosPublico = async (req, res) => {
  try {
    const { videos, users } = initModels(sequelize);
    const allVideos = await videos.findAll({
      where: { estado: 'publicado' },
      include: [
        {
          model: users,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['dificultad', 'ASC'], ['fecha_creacion', 'DESC']]
    });
    res.json(allVideos);
  } catch (error) {
    console.error('Error en getAllVideosPublico:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
