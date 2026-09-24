// routes/song.routes.js
import express from 'express';
import * as songController from '../controllers/song.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/search', songController.buscar); // público (autocomplete)
router.get('/', songController.listar); // público (listar catálogo)
router.post('/', authenticate, songController.importar); // protegido: escribe en la base

export default router;
