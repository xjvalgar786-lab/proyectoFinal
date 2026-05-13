const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, verificarRol } = require("../middlewares/authMiddleware");

// Registrar nuevo usuario (público)
router.post("/register", authController.register);

// Login de usuario (público)
router.post("/login", authController.login);

// Logout de usuario (requiere autenticación)
router.post("/logout", verifyToken, authController.logout);

// Obtener perfil del usuario autenticado (requiere autenticación)
router.get("/profile", verifyToken, authController.getProfile);

// Editar perfil del usuario autenticado (requiere autenticación)
router.put("/profile", verifyToken, authController.updateProfile);

module.exports = router;
