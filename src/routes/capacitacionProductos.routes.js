import { Router } from 'express';
import {
  listarProductosCapacitacion,
  agregarProductoCapacitacion,
  actualizarProductoCapacitacion,
  eliminarProductoCapacitacion,
  agregarProductosMultiples
} from '../controllers/capacitacionProductos.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

/**
 * Rutas para manejar productos de capacitaciones
 * Todas las rutas requieren autenticación
 */

// GET /api/capacitaciones/:id/productos - Listar productos de una capacitación
router.get('/:id/productos', auth, listarProductosCapacitacion);

// POST /api/capacitaciones/:id/productos - Agregar un producto a una capacitación
router.post('/:id/productos', auth, agregarProductoCapacitacion);

// POST /api/capacitaciones/:id/productos/batch - Agregar múltiples productos
router.post('/:id/productos/batch', auth, agregarProductosMultiples);

// PUT /api/capacitaciones/:capacitacion_id/productos/:producto_id - Actualizar producto
router.put('/:capacitacion_id/productos/:producto_id', auth, actualizarProductoCapacitacion);

// DELETE /api/capacitaciones/:capacitacion_id/productos/:producto_id - Eliminar producto
router.delete('/:capacitacion_id/productos/:producto_id', auth, eliminarProductoCapacitacion);

export default router;
