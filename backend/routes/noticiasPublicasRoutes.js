const express = require("express");
const router = express.Router();
const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

// Ruta pública para que jugadores vean noticias publicadas
router.get("/publicadas", async (req, res) => {
  try {
    const { noticias } = initModels(sequelize);
    const data = await noticias.findAll({
      where: { estado: 'publicada' },
      attributes: ['id', 'titulo', 'contenido', 'fecha_publicacion'],
      order: [['fecha_publicacion', 'DESC']]
    });

    return res.status(200).json(Respuesta.exito(data, "Noticias publicadas obtenidas"));
  } catch (error) {
    logMensaje("Error en getNoticiasPublicadas: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener noticias"));
  }
});

// Ruta pública para obtener una noticia específica
router.get("/publicadas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { noticias } = initModels(sequelize);

    const data = await noticias.findOne({
      where: { id, estado: 'publicada' },
      attributes: ['id', 'titulo', 'contenido', 'fecha_publicacion']
    });

    if (!data) {
      return res.status(404).json(Respuesta.error(null, "Noticia no encontrada"));
    }

    return res.status(200).json(Respuesta.exito(data, "Noticia obtenida"));
  } catch (error) {
    logMensaje("Error en getNoticiaPublicada: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener la noticia"));
  }
});

module.exports = router;