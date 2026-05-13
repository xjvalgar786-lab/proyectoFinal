const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

class TorneosController {
  async getAllTorneos(req, res) {
    try {
      const { torneos } = initModels(sequelize);
      const data = await torneos.findAll();

      return res.status(200).json(Respuesta.exito(data, "Torneos obtenidos correctamente"));
    } catch (error) {
      logMensaje("Error en getAllTorneos: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener torneos"));
    }
  }

  async getTorneoById(req, res) {
    try {
      const { id } = req.params;
      const { torneos } = initModels(sequelize);

      const data = await torneos.findByPk(id);
      if (!data) {
        return res.status(404).json(Respuesta.error(null, "Torneo no encontrado"));
      }

      return res.status(200).json(Respuesta.exito(data, "Torneo obtenido correctamente"));
    } catch (error) {
      logMensaje("Error en getTorneoById: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener el torneo"));
    }
  }

  async createTorneo(req, res) {
    try {
      const { nombre, descripcion, fecha_inicio, fecha_fin, max_jugadores } = req.body;
      const { torneos } = initModels(sequelize);

      if (!nombre || !fecha_inicio) {
        return res.status(400).json(Respuesta.error(null, "Nombre y fecha de inicio son obligatorios"));
      }

      const newTorneo = await torneos.create({
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        max_jugadores: max_jugadores || 16,
        estado: 'abierto'
      });

      return res.status(201).json(Respuesta.exito(newTorneo, "Torneo creado correctamente"));
    } catch (error) {
      logMensaje("Error en createTorneo: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al crear el torneo"));
    }
  }

  async updateTorneo(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, fecha_inicio, fecha_fin, max_jugadores, estado } = req.body;
      const { torneos } = initModels(sequelize);

      const torneo = await torneos.findByPk(id);
      if (!torneo) {
        return res.status(404).json(Respuesta.error(null, "Torneo no encontrado"));
      }

      await torneo.update({
        nombre: nombre || torneo.nombre,
        descripcion: descripcion || torneo.descripcion,
        fecha_inicio: fecha_inicio || torneo.fecha_inicio,
        fecha_fin: fecha_fin || torneo.fecha_fin,
        max_jugadores: max_jugadores || torneo.max_jugadores,
        estado: estado || torneo.estado
      });

      return res.status(200).json(Respuesta.exito(torneo, "Torneo actualizado correctamente"));
    } catch (error) {
      logMensaje("Error en updateTorneo: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al actualizar el torneo"));
    }
  }

  async getTournamentBracket(req, res) {
    try {
      const { id } = req.params;
      const { partidos, users } = initModels(sequelize);

      const matches = await partidos.findAll({
        where: { torneo_id: id },
        include: [
          { model: users, as: 'jugador1', attributes: ['id', 'nombre', 'apellido'] },
          { model: users, as: 'jugador2', attributes: ['id', 'nombre', 'apellido'] },
          { model: users, as: 'ganador', attributes: ['id', 'nombre', 'apellido'] }
        ],
        order: [['ronda', 'ASC'], ['id', 'ASC']]
      });

      return res.status(200).json(Respuesta.exito(matches, "Bracket del torneo obtenido"));
    } catch (error) {
      logMensaje("Error en getTournamentBracket: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener el bracket"));
    }
  }

  async simulateTournament(req, res) {
    try {
      const { id } = req.params;
      const { torneos, inscripciones, users } = initModels(sequelize);

      logMensaje(`Iniciando simulación del torneo ${id}`);

      const torneo = await torneos.findByPk(id);
      if (!torneo) {
        logMensaje(`Torneo ${id} no encontrado`);
        return res.status(404).json(Respuesta.error(null, "Torneo no encontrado"));
      }

      if (torneo.estado !== 'abierto') {
        logMensaje(`Torneo ${id} no está en estado abierto: ${torneo.estado}`);
        return res.status(400).json(Respuesta.error(null, "El torneo no está en estado para simular"));
      }

      // Contar inscritos activos
      const count = await inscripciones.count({
        where: { torneo_id: id, estado: 'activa' }
      });

      logMensaje(`Torneo ${id} tiene ${count} inscritos activos`);

      if (count !== 8) {
        return res.status(400).json(Respuesta.error(null, `El torneo debe tener exactamente 8 jugadores inscritos. Actualmente tiene ${count}`));
      }

      // Obtener los 8 jugadores
      const inscritos = await inscripciones.findAll({
        where: { torneo_id: id, estado: 'activa' },
        include: [{ model: users, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'puntos'] }]
      });

      const players = inscritos.map(i => i.usuario);
      logMensaje(`Jugadores obtenidos: ${players.map(p => p.nombre).join(', ')}`);

      // Funciones auxiliares definidas localmente
      const simulateMatch = (player1, player2, ronda, torneoId) => {
        const p1 = player1.puntos || 0;
        const p2 = player2.puntos || 0;
        const totalPoints = p1 + p2;
        const prob1 = totalPoints > 0 ? p1 / totalPoints : 0.5;
        
        // Simular sets ganados (mejor de 5 sets)
        let setsPlayer1 = 0;
        let setsPlayer2 = 0;
        let winner = null;
        
        // Simular hasta que alguien gane 3 sets
        while (setsPlayer1 < 3 && setsPlayer2 < 3) {
          const random = Math.random();
          if (random < prob1) {
            setsPlayer1++;
          } else {
            setsPlayer2++;
          }
        }
        
        winner = setsPlayer1 === 3 ? player1 : player2;
        
        // Guardar el partido en la base de datos con sets ganados
        const { partidos } = initModels(sequelize);
        partidos.create({
          torneo_id: torneoId,
          jugador1_id: player1.id,
          jugador2_id: player2.id,
          ronda: ronda,
          resultado_jugador1: setsPlayer1,
          resultado_jugador2: setsPlayer2,
          ganador_id: winner.id
        });
        
        return winner;
      };

      const runTournamentSimulation = (players, torneoId) => {
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        
        // Cuartos de final: 8 -> 4
        const quarters = [];
        for (let i = 0; i < 8; i += 2) {
          quarters.push(simulateMatch(shuffled[i], shuffled[i + 1], 1, torneoId));
        }
        
        // Semifinales: 4 -> 2
        const semis = [];
        for (let i = 0; i < 4; i += 2) {
          semis.push(simulateMatch(quarters[i], quarters[i + 1], 2, torneoId));
        }
        
        // Final: 2 -> 1
        const winner = simulateMatch(semis[0], semis[1], 3, torneoId);
        
        // Devolver información completa del torneo
        return {
          winner: winner,
          finalist: winner === semis[0] ? semis[1] : semis[0], // El que perdió la final
          semifinalists: semis, // Los dos semifinalistas
          quarterfinalists: quarters // Los cuatro cuartofinalistas
        };
      };

      // Simular torneo
      const tournamentResult = runTournamentSimulation(players, id);
      const { winner, finalist, semifinalists, quarterfinalists } = tournamentResult;
      logMensaje(`Ganador del torneo: ${winner.nombre} ${winner.apellido}`);
      logMensaje(`Subcampeón: ${finalist.nombre} ${finalist.apellido}`);

      // Crear mapa de puntos por jugador
      const pointsMap = new Map();
      
      // Inicializar todos con 0
      players.forEach(player => pointsMap.set(player.id, 0));
      
      // Asignar puntos según posición
      pointsMap.set(winner.id, 75); // Ganador
      pointsMap.set(finalist.id, 50); // Subcampeón
      
      // Semifinalistas (25 puntos) - son los que llegaron a semis pero no a la final
      semifinalists.forEach(player => {
        if (player.id !== winner.id && player.id !== finalist.id) {
          pointsMap.set(player.id, 25);
        }
      });
      
      // Cuartofinalistas ya tienen 0 puntos (valor por defecto)

      // Actualizar puntos en la base de datos
      for (const player of players) {
        const pointsToAdd = pointsMap.get(player.id) || 0;
        const newPoints = (player.puntos || 0) + pointsToAdd;
        await users.update({ puntos: newPoints }, { where: { id: player.id } });
        logMensaje(`Jugador ${player.nombre} ${player.apellido}: ${player.puntos || 0} + ${pointsToAdd} = ${newPoints} puntos`);
      }

      // Cambiar estado del torneo a finalizado
      await torneo.update({ estado: 'finalizado' });

      return res.status(200).json(Respuesta.exito({ 
        winner: winner.nombre + ' ' + winner.apellido,
        finalist: finalist.nombre + ' ' + finalist.apellido,
        points: {
          winner: 75,
          finalist: 50,
          semifinalists: 25,
          quarterfinalists: 0
        }
      }, "Torneo simulado correctamente"));
    } catch (error) {
      logMensaje("Error en simulateTournament: " + error);
      console.error(error);
      return res.status(500).json(Respuesta.error(null, "Error al simular el torneo"));
    }
  }

  async deleteTorneo(req, res) {
    try {
      const { id } = req.params;
      const { torneos } = initModels(sequelize);

      const torneo = await torneos.findByPk(id);
      if (!torneo) {
        return res.status(404).json(Respuesta.error(null, "Torneo no encontrado"));
      }

      await torneo.destroy();

      return res.status(200).json(Respuesta.exito(null, "Torneo eliminado correctamente"));
    } catch (error) {
      logMensaje("Error en deleteTorneo: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al eliminar el torneo"));
    }
  }
}

module.exports = new TorneosController();