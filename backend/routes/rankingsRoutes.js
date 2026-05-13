const express = require("express");
const router = express.Router();
const rankingsController = require("../controllers/rankingsController");
const { verifyToken, verificarRol } = require("../middlewares/authMiddleware");

// Obtener todos los rankings (público)
router.get("/", rankingsController.getAllRankings);

// Obtener ranking del mes actual (público)
router.get("/mes/actual", rankingsController.getRankingCurrentMonth);

// Obtener ranking de todos los jugadores (público)
router.get("/jugadores", rankingsController.getRankingJugadores);

// Obtener rankings de un usuario (público)
router.get("/usuario/:usuario_id", rankingsController.getRankingByUsuario);

// Obtener historial de puntos del usuario autenticado (requiere autenticación)
router.get("/puntos/history", verifyToken, rankingsController.getPuntosHistory);

// Actualizar ranking (solo admin)
router.put("/:id", verifyToken, verificarRol(['administrador']), rankingsController.updateRanking);

module.exports = router;