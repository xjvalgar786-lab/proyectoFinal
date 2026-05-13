const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

// Obtener todos los rankings (público)
exports.getAllRankings = async (req, res) => {
  try {
    const { rankings, users } = initModels(sequelize);
    const data = await rankings.findAll({
      include: [{ model: users, attributes: ['id', 'nombre', 'apellido', 'email'] }],
      order: [['posicion', 'ASC']]
    });

    return res.status(200).json(Respuesta.exito(data, "Rankings obtenidos correctamente"));
  } catch (error) {
    logMensaje("Error en getAllRankings: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener rankings"));
  }
};

// Obtener ranking del mes actual (público)
exports.getRankingCurrentMonth = async (req, res) => {
  try {
    const { rankings, users } = initModels(sequelize);
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    const data = await rankings.findAll({
      where: { mes, ano },
      include: [{ model: users, attributes: ['id', 'nombre', 'apellido', 'email', 'puntos'] }],
      order: [['posicion', 'ASC']],
      limit: 10
    });

    return res.status(200).json(Respuesta.exito(data, "Ranking del mes actual"));
  } catch (error) {
    logMensaje("Error en getRankingCurrentMonth: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener el ranking del mes"));
  }
};

// Obtener ranking de todos los jugadores (público)
exports.getRankingJugadores = async (req, res) => {
  try {
    const { users } = initModels(sequelize);
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows: data } = await users.findAndCountAll({
      where: { rol: 'jugador' },
      attributes: ['id', 'nombre', 'apellido', 'email', 'puntos', 'nacionalidad'],
      order: [
        ['puntos', 'DESC'], // Primero por puntos descendentes
        ['nombre', 'ASC']   // Luego por nombre alfabético
      ],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(Respuesta.exito({
      players: data,
      pagination: {
        currentPage: page,
        totalPages,
        totalPlayers: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, "Ranking de jugadores obtenido correctamente"));
  } catch (error) {
    logMensaje("Error en getRankingJugadores: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener el ranking de jugadores"));
  }
};

// Obtener rankings de un usuario (público)
exports.getRankingByUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const { rankings } = initModels(sequelize);

    const data = await rankings.findAll({
      where: { usuario_id },
      order: [['ano', 'DESC'], ['mes', 'DESC']]
    });

    return res.status(200).json(Respuesta.exito(data, "Rankings del usuario obtenidos"));
  } catch (error) {
    logMensaje("Error en getRankingByUsuario: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener los rankings del usuario"));
  }
};

// Actualizar ranking (solo admin)
exports.updateRanking = async (req, res) => {
  try {
    const { id } = req.params;
    const { posicion, puntos_totales } = req.body;
    const { rankings } = initModels(sequelize);

    const ranking = await rankings.findByPk(id);
    if (!ranking) {
      return res.status(404).json(Respuesta.error(null, "Ranking no encontrado"));
    }

    await ranking.update({
      posicion: posicion || ranking.posicion,
      puntos_totales: puntos_totales || ranking.puntos_totales
    });

    return res.status(200).json(Respuesta.exito(ranking, "Ranking actualizado correctamente"));
  } catch (error) {
    logMensaje("Error en updateRanking: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al actualizar el ranking"));
  }
};

// Obtener historial de puntos del usuario autenticado (requiere autenticación)
exports.getPuntosHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rankings } = initModels(sequelize);

    const data = await rankings.findAll({
      where: { usuario_id: userId },
      order: [['ano', 'ASC'], ['mes', 'ASC']],
      attributes: ['puntos_totales', 'mes', 'ano', 'createdAt']
    });

    // Si no hay datos históricos, devolver puntos actuales
    if (data.length === 0) {
      const { users } = initModels(sequelize);
      const user = await users.findByPk(userId, { attributes: ['puntos'] });
      return res.status(200).json(Respuesta.exito([{
        puntos_totales: user.puntos,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        createdAt: new Date()
      }], "Historial de puntos obtenido"));
    }

    return res.status(200).json(Respuesta.exito(data, "Historial de puntos obtenido"));
  } catch (error) {
    logMensaje("Error en getPuntosHistory: " + error);
    return res.status(500).json(Respuesta.error(null, "Error al obtener el historial de puntos"));
  }
};
