import express from "express";
import {
  login,
  crearUsuario,
  listarUsuarios,
  buscarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  actualizarPerfil,
  actualizarFirma,
  cambiarPassword,
} from "../controllers/usuarios.controller.js";

import { auth, soloAdmin } from "../middlewares/auth.js";
import { uploadFirma } from "../middlewares/uploadFirma.js";

const router = express.Router();

// LOGIN
router.post("/login", login);

// SOLO EL USUARIO LOGUEADO (Antes de las rutas con parámetros)
router.put("/perfil", auth, uploadFirma.single("firma"), actualizarPerfil);
router.put("/firma", auth, uploadFirma.single("firma"), actualizarFirma);
router.put("/password", auth, cambiarPassword);

// SOLO ADMIN
router.post("/", auth, soloAdmin, uploadFirma.single("firma"), crearUsuario);
router.get("/", auth, soloAdmin, listarUsuarios);
router.get("/buscar", auth, soloAdmin, buscarUsuarios);
router.get("/:id", auth, soloAdmin, obtenerUsuario);
router.put("/:id", auth, soloAdmin, uploadFirma.single("firma"), actualizarUsuario);
router.delete("/:id", auth, soloAdmin, eliminarUsuario);

export default router;
