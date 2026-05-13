const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");


router.get("/disponibles", async (req, res) => {
  try {
    const { torneos } = initModels(sequelize);
    const now = new Date();
    const data = await torneos.findAll({
      where: { 
        estado: ['abierto', 'en_curso'],
        [Op.or]: [
          { fecha_fin: null },
          { fecha_fin: { [Op.gt]: now } }
        ]
      },
      attributes: ['id', 'nombre', 'descripcion', 'fecha_inicio', 'max_jugadores', 'estado']
    });

    return res.status(200).json(Respuesta.exito(data, "Torneos disponibles obtenidos"));
  } catch (error) {
    logMensaje("Error en getTorneosDisponibles: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener torneos"));
  }
});

module.exports = router;