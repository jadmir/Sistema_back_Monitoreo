import { Router } from "express";
import {
  listarSecciones,
  obtenerSeccion,
  crearSeccion,
  actualizarSeccion,
  eliminarSeccion,
  obtenerProductosDeSeccion
} from "../controllers/secciones.controller.js";
import { auth, soloAdmin } from "../middlewares/auth.js";

const router = Router();

// Rutas públicas (requieren autenticación)
router.get("/", auth, listarSecciones);
router.get("/:id", auth, obtenerSeccion);
router.get("/:id/productos", auth, obtenerProductosDeSeccion);

// Rutas de administrador
router.post("/", auth, soloAdmin, crearSeccion);
router.put("/:id", auth, soloAdmin, actualizarSeccion);
router.delete("/:id", auth, soloAdmin, eliminarSeccion);

export default router;
