const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json(Respuesta.error(null, "Token no proporcionado"));
    }

    const decoded = jwt.verify(token, config.secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    logMensaje("Error en verifyToken: " + error);
    return res.status(401).json(Respuesta.error(null, "Token inválido o expirado"));
  }
};

const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.rol) {
        return res.status(401).json(Respuesta.error(null, "Usuario no autenticado"));
      }

      if (!rolesPermitidos.includes(req.user.rol)) {
        return res.status(403).json(Respuesta.error(null, "No tienes permisos para esta acción"));
      }

      next();
    } catch (error) {
      logMensaje("Error en verificarRol: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al verificar permisos"));
    }
  };
};

module.exports = {
  verifyToken,
  verificarRol
};
