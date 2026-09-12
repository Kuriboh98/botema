// routes/song.routes.js
import express from 'express';
import * as songController from '../controllers/song.controller.js';

const router = express.Router();

router.get('/search', songController.buscar);
router.get('/', songController.listar); 
router.post('/', songController.importar); 

export default router;
