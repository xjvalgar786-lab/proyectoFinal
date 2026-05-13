const express = require('express');
const router = express.Router();
const videosController = require('../controllers/videosController');

// Público: Obtener todos los videos publicados
router.get('/', videosController.getAllVideosPublico);

// Público: Obtener videos por dificultad
router.get('/:dificultad', videosController.getVideosByDificultadPublico);

module.exports = router;
