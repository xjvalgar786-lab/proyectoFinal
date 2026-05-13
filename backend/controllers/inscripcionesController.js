const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

class InscripcionesController {
  async getAllInscripciones(req, res) {
    try {
      const { inscripciones, users, torneos } = initModels(sequelize);
      const data = await inscripciones.findAll({
        include: [
          { model: users, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email'] },
          { model: torneos, attributes: ['id', 'nombre', 'estado'] }
        ]
      });

      return res.status(200).json(Respuesta.exito(data, "Inscripciones obtenidas correctamente"));
    } catch (error) {
      logMensaje("Error en getAllInscripciones: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener inscripciones"));
    }
  }

  async getInscripcionesByUsuario(req, res) {
    try {
      const { usuario_id } = req.params;
      const { inscripciones, torneos } = initModels(sequelize);

      const data = await inscripciones.findAll({
        where: { usuario_id, estado: 'activa' },
        include: [{ model: torneos, attributes: ['id', 'nombre', 'estado'] }]
      });

      return res.status(200).json(Respuesta.exito(data, "Inscripciones del usuario obtenidas"));
    } catch (error) {
      logMensaje("Error en getInscripcionesByUsuario: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener inscripciones del usuario"));
    }
  }

  async getInscripcionesByTorneo(req, res) {
    try {
      const { torneo_id } = req.params;
      const { inscripciones, users } = initModels(sequelize);

      const data = await inscripciones.findAll({
        where: { torneo_id, estado: 'activa' },
        include: [{ model: users, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email', 'puntos'] }]
      });

      return res.status(200).json(Respuesta.exito(data, "Inscripciones del torneo obtenidas"));
    } catch (error) {
      logMensaje("Error en getInscripcionesByTorneo: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener inscripciones del torneo"));
    }
  }

  async createInscripcion(req, res) {
    try {
      const { usuario_id, torneo_id } = req.body;
      const { inscripciones } = initModels(sequelize);

      if (!usuario_id || !torneo_id) {
        return res.status(400).json(Respuesta.error(null, "Usuario y torneo son obligatorios"));
      }

      // Verificar si ya existe una inscripción ACTIVA
      const existingActiva = await inscripciones.findOne({
        where: { usuario_id, torneo_id, estado: 'activa' }
      });

      if (existingActiva) {
        return res.status(409).json(Respuesta.error(null, "El usuario ya está inscrito en este torneo"));
      }

      // Verificar si existe una inscripción CANCELADA
      const existingCancelada = await inscripciones.findOne({
        where: { usuario_id, torneo_id, estado: 'cancelada' }
      });

      // Si existe cancelada, actualizar a activa
      if (existingCancelada) {
        await existingCancelada.update({ estado: 'activa' });
        return res.status(200).json(Respuesta.exito(existingCancelada, "Reinscripción exitosa"));
      }

      // Si no existe ninguna, crear nueva
      const newInscripcion = await inscripciones.create({
        usuario_id,
        torneo_id,
        estado: 'activa'
      });

      return res.status(201).json(Respuesta.exito(newInscripcion, "Inscripción creada correctamente"));
    } catch (error) {
      logMensaje("Error en createInscripcion: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al crear la inscripción"));
    }
  }

  async deleteInscripcion(req, res) {
    try {
      const { id } = req.params;
      const { inscripciones } = initModels(sequelize);

      const inscripcion = await inscripciones.findByPk(id);
      if (!inscripcion) {
        return res.status(404).json(Respuesta.error(null, "Inscripción no encontrada"));
      }

      // Cambiar estado a cancelada en lugar de eliminar
      await inscripcion.update({ estado: 'cancelada' });

      return res.status(200).json(Respuesta.exito(null, "Inscripción cancelada correctamente"));
    } catch (error) {
      logMensaje("Error en deleteInscripcion: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al cancelar la inscripción"));
    }
  }
}

module.exports = new InscripcionesController();