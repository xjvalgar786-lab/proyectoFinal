const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

class NoticiasController {
  async getAllNoticias(req, res) {
    try {
      const { noticias, users } = initModels(sequelize);
      const data = await noticias.findAll({
        where: { estado: 'publicada' },
        include: [{ model: users, attributes: ['id', 'nombre', 'apellido'], as: null }],
        order: [['fecha_publicacion', 'DESC']]
      });

      return res.status(200).json(Respuesta.exito(data, "Noticias obtenidas correctamente"));
    } catch (error) {
      logMensaje("Error en getAllNoticias: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener noticias"));
    }
  }

  async getNoticiaById(req, res) {
    try {
      const { id } = req.params;
      const { noticias } = initModels(sequelize);

      const data = await noticias.findByPk(id);
      if (!data) {
        return res.status(404).json(Respuesta.error(null, "Noticia no encontrada"));
      }

      return res.status(200).json(Respuesta.exito(data, "Noticia obtenida correctamente"));
    } catch (error) {
      logMensaje("Error en getNoticiaById: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener la noticia"));
    }
  }

  async createNoticia(req, res) {
    try {
      const { titulo, contenido, autor_id } = req.body;
      const { noticias } = initModels(sequelize);

      if (!titulo || !contenido) {
        return res.status(400).json(Respuesta.error(null, "Título y contenido son obligatorios"));
      }

      const newNoticia = await noticias.create({
        titulo,
        contenido,
        autor_id: autor_id || req.user?.id,
        estado: 'publicada'
      });

      return res.status(201).json(Respuesta.exito(newNoticia, "Noticia creada correctamente"));
    } catch (error) {
      logMensaje("Error en createNoticia: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al crear la noticia"));
    }
  }

  async updateNoticia(req, res) {
    try {
      const { id } = req.params;
      const { titulo, contenido, estado } = req.body;
      const { noticias } = initModels(sequelize);

      const noticia = await noticias.findByPk(id);
      if (!noticia) {
        return res.status(404).json(Respuesta.error(null, "Noticia no encontrada"));
      }

      await noticia.update({
        titulo: titulo || noticia.titulo,
        contenido: contenido || noticia.contenido,
        estado: estado || noticia.estado
      });

      return res.status(200).json(Respuesta.exito(noticia, "Noticia actualizada correctamente"));
    } catch (error) {
      logMensaje("Error en updateNoticia: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al actualizar la noticia"));
    }
  }

  async deleteNoticia(req, res) {
    try {
      const { id } = req.params;
      const { noticias } = initModels(sequelize);

      const noticia = await noticias.findByPk(id);
      if (!noticia) {
        return res.status(404).json(Respuesta.error(null, "Noticia no encontrada"));
      }

      await noticia.destroy();

      return res.status(200).json(Respuesta.exito(null, "Noticia eliminada correctamente"));
    } catch (error) {
      logMensaje("Error en deleteNoticia: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al eliminar la noticia"));
    }
  }
}

module.exports = new NoticiasController();