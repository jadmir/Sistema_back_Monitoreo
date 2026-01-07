import { Router } from 'express';
import { auth, soloAdmin } from '../middlewares/auth.js';
import {
  listarProductos,
  listarProductosPorSeccion,
  buscarProductos,
  obtenerProductoPorId,
  listarSecciones,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from '../controllers/productos.controller.js';

const router = Router();

// Rutas de secciones
router.get('/secciones', auth, listarSecciones);

// Rutas de productos - Rutas específicas primero
router.get('/buscar', auth, buscarProductos);
router.get('/seccion/:seccionId', auth, listarProductosPorSeccion);

// Rutas generales
router.get('/', auth, listarProductos);
router.get('/:id', auth, obtenerProductoPorId);

// Rutas de administrador
router.post('/', auth, soloAdmin, crearProducto);
router.put('/:id', auth, soloAdmin, actualizarProducto);
router.delete('/:id', auth, soloAdmin, eliminarProducto);

export default router;
