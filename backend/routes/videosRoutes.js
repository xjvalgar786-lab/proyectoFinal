const express = require('express');
const router = express.Router();
const videosController = require('../controllers/videosController');
const { verifyToken, verificarRol } = require('../middlewares/authMiddleware');

// Admin: Obtener todos los videos
router.get('/', verifyToken, verificarRol(['administrador']), videosController.getAllVideos);

// Admin: Obtener videos archivados
router.get('/archivados/todos', verifyToken, verificarRol(['administrador']), videosController.getArchivedVideos);

// Admin: Obtener videos por dificultad
router.get('/admin/:dificultad', verifyToken, verificarRol(['administrador']), videosController.getVideosByDificultad);

// Admin: Crear video
router.post('/', verifyToken, verificarRol(['administrador']), videosController.createVideo);

// Admin: Actualizar video
router.put('/:id', verifyToken, verificarRol(['administrador']), videosController.updateVideo);

// Admin: Eliminar video
router.delete('/:id', verifyToken, verificarRol(['administrador']), videosController.deleteVideo);

// Admin: Restaurar video (desarchitar)
router.patch('/:id/restore', verifyToken, verificarRol(['administrador']), videosController.restoreVideo);

// Admin: Eliminar permanentemente (hard delete)
router.delete('/:id/permanent', verifyToken, verificarRol(['administrador']), videosController.permanentDeleteVideo);

module.exports = router;
