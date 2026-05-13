const express = require("express");
const router = express.Router();
const torneosController = require("../controllers/torneosController");
const { verifyToken, verificarRol } = require("../middlewares/authMiddleware");

// Obtener todos los torneos (solo admin)
router.get("/", verifyToken, verificarRol(['administrador']), torneosController.getAllTorneos);

// Obtener torneo por ID (solo admin)
router.get("/:id", verifyToken, verificarRol(['administrador']), torneosController.getTorneoById);

// Crear torneo (solo admin)
router.post("/", verifyToken, verificarRol(['administrador']), torneosController.createTorneo);

// Actualizar torneo (solo admin)
router.put("/:id", verifyToken, verificarRol(['administrador']), torneosController.updateTorneo);

// Obtener bracket de un torneo (solo admin)
router.get("/:id/bracket", verifyToken, verificarRol(['administrador']), torneosController.getTournamentBracket);

// Simular torneo (solo admin)
router.post("/:id/simular", verifyToken, verificarRol(['administrador']), torneosController.simulateTournament);

// Eliminar torneo (solo admin)
router.delete("/:id", verifyToken, verificarRol(['administrador']), torneosController.deleteTorneo);

module.exports = router;