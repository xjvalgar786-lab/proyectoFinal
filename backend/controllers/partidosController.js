const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

class PartidosController {
  async getAllPartidos(req, res) {
    try {
      const { partidos } = initModels(sequelize);
      const data = await partidos.findAll({
        include: ['jugador1', 'jugador2', 'ganador']
      });

      return res.status(200).json(Respuesta.exito(data, "Partidos obtenidos correctamente"));
    } catch (error) {
      logMensaje("Error en getAllPartidos: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener partidos"));
    }
  }

  async getPartidosByTorneo(req, res) {
    try {
      const { torneo_id } = req.params;
      const { partidos } = initModels(sequelize);

      const data = await partidos.findAll({
        where: { torneo_id },
        include: ['jugador1', 'jugador2', 'ganador'],
        order: [['ronda', 'ASC']]
      });

      return res.status(200).json(Respuesta.exito(data, "Partidos del torneo obtenidos"));
    } catch (error) {
      logMensaje("Error en getPartidosByTorneo: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener partidos del torneo"));
    }
  }

  async createPartido(req, res) {
    try {
      const { torneo_id, jugador1_id, jugador2_id, ronda } = req.body;
      const { partidos } = initModels(sequelize);

      if (!torneo_id || !jugador1_id || !jugador2_id || !ronda) {
        return res.status(400).json(Respuesta.error(null, "Todos los campos son obligatorios"));
      }

      const newPartido = await partidos.create({
        torneo_id,
        jugador1_id,
        jugador2_id,
        ronda,
        estado: 'pendiente'
      });

      return res.status(201).json(Respuesta.exito(newPartido, "Partido creado correctamente"));
    } catch (error) {
      logMensaje("Error en createPartido: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al crear el partido"));
    }
  }

  async updatePartido(req, res) {
    try {
      const { id } = req.params;
      const { resultado_jugador1, resultado_jugador2, ganador_id, estado, fecha_partido } = req.body;
      const { partidos } = initModels(sequelize);

      const partido = await partidos.findByPk(id);
      if (!partido) {
        return res.status(404).json(Respuesta.error(null, "Partido no encontrado"));
      }

      await partido.update({
        resultado_jugador1: resultado_jugador1 !== undefined ? resultado_jugador1 : partido.resultado_jugador1,
        resultado_jugador2: resultado_jugador2 !== undefined ? resultado_jugador2 : partido.resultado_jugador2,
        ganador_id: ganador_id || partido.ganador_id,
        estado: estado || partido.estado,
        fecha_partido: fecha_partido || partido.fecha_partido
      });

      return res.status(200).json(Respuesta.exito(partido, "Partido actualizado correctamente"));
    } catch (error) {
      logMensaje("Error en updatePartido: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al actualizar el partido"));
    }
  }

  async deletePartido(req, res) {
    try {
      const { id } = req.params;
      const { partidos } = initModels(sequelize);

      const partido = await partidos.findByPk(id);
      if (!partido) {
        return res.status(404).json(Respuesta.error(null, "Partido no encontrado"));
      }

      await partido.destroy();

      return res.status(200).json(Respuesta.exito(null, "Partido eliminado correctamente"));
    } catch (error) {
      logMensaje("Error en deletePartido: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al eliminar el partido"));
    }
  }
}

module.exports = new PartidosController();