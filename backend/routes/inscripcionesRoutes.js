const express = require("express");
const router = express.Router();
const inscripcionesController = require("../controllers/inscripcionesController");
const { verifyToken, verificarRol } = require("../middlewares/authMiddleware");

// Obtener todas las inscripciones (solo admin)
router.get("/", verifyToken, verificarRol(['administrador']), inscripcionesController.getAllInscripciones);

// Obtener inscripciones del usuario autenticado
router.get("/usuario/:usuario_id", verifyToken, inscripcionesController.getInscripcionesByUsuario);

// Obtener inscripciones por torneo (requiere autenticación)
router.get("/torneo/:torneo_id", verifyToken, inscripcionesController.getInscripcionesByTorneo);

// Crear inscripción (requiere autenticación - cualquier rol)
router.post("/", verifyToken, inscripcionesController.createInscripcion);

// Eliminar inscripción (requiere autenticación - el jugador o admin)
router.delete("/:id", verifyToken, inscripcionesController.deleteInscripcion);

module.exports = router;