const express = require("express");
const router = express.Router();
const partidosController = require("../controllers/partidosController");
const { verifyToken, verificarRol } = require("../middlewares/authMiddleware");

// Obtener todos los partidos (público)
router.get("/", partidosController.getAllPartidos);

// Obtener partidos por torneo (público)
router.get("/torneo/:torneo_id", partidosController.getPartidosByTorneo);

// Crear partido (solo admin)
router.post("/", verifyToken, verificarRol(['administrador']), partidosController.createPartido);

// Actualizar partido (solo admin)
router.put("/:id", verifyToken, verificarRol(['administrador']), partidosController.updatePartido);

// Eliminar partido (solo admin)
router.delete("/:id", verifyToken, verificarRol(['administrador']), partidosController.deletePartido);

module.exports = router;