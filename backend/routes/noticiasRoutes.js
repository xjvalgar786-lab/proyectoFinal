const express = require("express");
const router = express.Router();
const noticiasController = require("../controllers/noticiasController");
const { verifyToken, verificarRol } = require("../middlewares/authMiddleware");

// Obtener todas las noticias (solo admin)
router.get("/", verifyToken, verificarRol(['administrador']), noticiasController.getAllNoticias);

// Obtener noticia por ID (solo admin)
router.get("/:id", verifyToken, verificarRol(['administrador']), noticiasController.getNoticiaById);

// Crear noticia (solo admin)
router.post("/", verifyToken, verificarRol(['administrador']), noticiasController.createNoticia);

// Actualizar noticia (solo admin)
router.put("/:id", verifyToken, verificarRol(['administrador']), noticiasController.updateNoticia);

// Eliminar noticia (solo admin)
router.delete("/:id", verifyToken, verificarRol(['administrador']), noticiasController.deleteNoticia);

module.exports = router;