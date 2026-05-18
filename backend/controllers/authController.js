const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const initModels = require("../models/init-models");
const config = require("../config/config");
const Respuesta = require("../utils/respuesta");
const { logMensaje } = require("../utils/logger");

class AuthController {
  async register(req, res) {
    try {
      const { nombre, apellido, email, password, nacionalidad } = req.body;
      const sequelize = require("../config/sequelize");
      const { users } = initModels(sequelize);

      // Validaciones
      if (!nombre || !apellido || !email || !password) {
        return res.status(400).json(Respuesta.error(null, "Por favor completa todos los campos obligatorios"));
      }

      // Verificar si el email ya existe
      const userExists = await users.findOne({ where: { email } });
      if (userExists) {
        return res.status(409).json(Respuesta.error(null, "El email ya está registrado"));
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario
      const newUser = await users.create({
        nombre,
        apellido,
        email,
        password: hashedPassword,
        nacionalidad: nacionalidad || null,
        puntos: 0,
        rol: "jugador",
      });

      // Generar token JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, rol: newUser.rol },
        config.secretKey,
        { expiresIn: "24h" }
      );

      // Configurar cookie HttpOnly
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      return res.status(201).json(Respuesta.exito({
        id: newUser.id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        nacionalidad: newUser.nacionalidad,
        puntos: newUser.puntos,
        rol: newUser.rol,
      }, "Usuario registrado exitosamente"));
    } catch (error) {
      logMensaje("Error en register: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al registrar el usuario"));
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const sequelize = require("../config/sequelize");
      const { users } = initModels(sequelize);

      // Validaciones
      if (!email || !password) {
        return res.status(400).json(Respuesta.error(null, "Por favor ingresa email y contraseña"));
      }

      // Buscar usuario
      const user = await users.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json(Respuesta.error(null, "Email o contraseña incorrectos"));
      }

      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json(Respuesta.error(null, "Email o contraseña incorrectos"));
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        config.secretKey,
        { expiresIn: "24h" }
      );

      console.log("LOGIN OK - TOKEN:", token);
      // Configurar cookie HttpOnly
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      return res.status(200).json(Respuesta.exito({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        nacionalidad: user.nacionalidad,
        puntos: user.puntos,
        rol: user.rol,
      }, "Login exitoso"));
    } catch (error) {
      logMensaje("Error en login: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al iniciar sesión"));
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const sequelize = require("../config/sequelize");
      const { users, partidos, inscripciones } = initModels(sequelize);

      const user = await users.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json(Respuesta.error(null, "Usuario no encontrado"));
      }

      const partidosJugados = await partidos.count({
        where: {
          [Op.or]: [
            { jugador1_id: userId },
            { jugador2_id: userId }
          ]
        }
      });

      const partidosGanados = await partidos.count({
        where: { ganador_id: userId }
      });

      const torneosInscritos = await inscripciones.count({
        where: { usuario_id: userId }
      });

      const userData = user.toJSON();
      userData.stats = {
        partidosJugados,
        partidosGanados,
        partidosPerdidos: partidosJugados - partidosGanados,
        torneosInscritos
      };

      return res.status(200).json(Respuesta.exito(userData, "Perfil obtenido correctamente"));
    } catch (error) {
      logMensaje("Error en getProfile: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al obtener el perfil"));
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { nombre, apellido, email, password, nacionalidad } = req.body;
      const sequelize = require("../config/sequelize");
      const { users, partidos, inscripciones } = initModels(sequelize);

      const user = await users.findByPk(userId);
      if (!user) {
        return res.status(404).json(Respuesta.error(null, "Usuario no encontrado"));
      }

      if (!nombre || !apellido || !email) {
        return res.status(400).json(Respuesta.error(null, "Nombre, apellido y email son obligatorios"));
      }

      if (email !== user.email) {
        const existingUser = await users.findOne({ where: { email } });
        if (existingUser) {
          return res.status(409).json(Respuesta.error(null, "El email ya está en uso"));
        }
      }

      const updatedData = {
        nombre,
        apellido,
        email,
        nacionalidad: nacionalidad !== undefined ? nacionalidad : user.nacionalidad,
      };

      if (password) {
        updatedData.password = await bcrypt.hash(password, 10);
      }

      await user.update(updatedData);

      const partidosJugados = await partidos.count({
        where: {
          [Op.or]: [
            { jugador1_id: userId },
            { jugador2_id: userId }
          ]
        }
      });

      const partidosGanados = await partidos.count({
        where: { ganador_id: userId }
      });

      const torneosInscritos = await inscripciones.count({
        where: { usuario_id: userId }
      });

      const userData = await users.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });
      const userJson = userData.toJSON();
      userJson.stats = {
        partidosJugados,
        partidosGanados,
        partidosPerdidos: partidosJugados - partidosGanados,
        torneosInscritos
      };

      return res.status(200).json(Respuesta.exito(userJson, "Perfil actualizado correctamente"));
    } catch (error) {
      logMensaje("Error en updateProfile: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al actualizar el perfil"));
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie('token');
      return res.status(200).json(Respuesta.exito(null, "Logout exitoso"));
    } catch (error) {
      logMensaje("Error en logout: " + error);
      return res.status(500).json(Respuesta.error(null, "Error al cerrar sesión"));
    }
  }
}

module.exports = new AuthController();
