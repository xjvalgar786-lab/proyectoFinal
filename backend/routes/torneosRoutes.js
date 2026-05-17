const express = require("express");
const router = express.Router();
const torneosController = require("../controllers/torneosController");
const { verifyToken, verificarRol } = require("../middlewares/authMiddleware");

// RUTAS ESPECÍFICAS DE PARTIDOS (deben ir primero para evitar conflicto con /:id)
router.put("/partidos/:id/resultado", verifyToken, verificarRol(['administrador']), torneosController.updateMatchResult);

// RUTAS GENERALES DE TORNEOS
// Obtener todos los torneos (solo admin)
router.get("/", verifyToken, verificarRol(['administrador']), torneosController.getAllTorneos);

// Crear torneo (solo admin)
router.post("/", verifyToken, verificarRol(['administrador']), torneosController.createTorneo);

// Rutas específicas de un torneo por ID (ir después de rutas estáticas)
// Obtener bracket de un torneo
router.get("/:id/bracket", verifyToken, verificarRol(['administrador']), torneosController.getTournamentBracket);

// Generar bracket manual
router.post("/:id/generar-bracket", verifyToken, verificarRol(['administrador']), torneosController.generateBracket);

// Finalizar torneo y asignar puntos
router.post("/:id/finalizar", verifyToken, verificarRol(['administrador']), torneosController.finalizeTournament);

// Simular torneo (solo admin) - MANTENER PARA COMPATIBILIDAD
router.post("/:id/simular", verifyToken, verificarRol(['administrador']), torneosController.simulateTournament);
// Obtener torneo por ID (debe ir al final porque coincide con /:id)
router.get("/:id", verifyToken, verificarRol(['administrador']), torneosController.getTorneoById);

// Actualizar torneo (solo admin)
router.put("/:id", verifyToken, verificarRol(['administrador']), torneosController.updateTorneo);

// Eliminar torneo (solo admin)
router.delete("/:id", verifyToken, verificarRol(['administrador']), torneosController.deleteTorneo);

module.exports = router;