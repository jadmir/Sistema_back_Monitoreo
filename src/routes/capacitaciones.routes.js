import express from "express";
import {
  crearCapacitacion,
  listarCapacitaciones,
  obtenerCapacitacion,
  generarWord,
  generarWordPrueba,
  generarPDF,
  listarPlantillas,
  obtenerReporteCapacitaciones,
  obtenerEstadisticas,
  exportarReporteExcel,
  exportarReporteCompletoExcel,
} from "../controllers/capacitaciones.controller.js";

import { auth } from "../middlewares/auth.js";
import { uploadFirma } from "../middlewares/uploadFirma.js";

const router = express.Router();

// RUTA DE PRUEBA - Generar Word con datos de ejemplo
router.get("/prueba-word", generarWordPrueba);

// Listar plantillas disponibles
router.get("/plantillas", auth, listarPlantillas);

// Obtener estadísticas
router.get("/estadisticas", auth, obtenerEstadisticas);

// Exportar reporte a Excel (simple)
router.get("/exportar-excel", auth, exportarReporteExcel);

// Exportar reporte completo a Excel (múltiples hojas)
router.get("/exportar-excel-completo", auth, exportarReporteCompletoExcel);

// Obtener reporte completo (JSON)
router.get("/reporte", auth, obtenerReporteCapacitaciones);

// Crear capacitación (con firma del responsable del centro)
router.post("/", auth, uploadFirma.single("firma_responsable_centro"), crearCapacitacion);

// Listar todas las capacitaciones (con filtros opcionales)
router.get("/", auth, listarCapacitaciones);

// Obtener una capacitación específica con todos sus datos
router.get("/:id", auth, obtenerCapacitacion);

// Generar documento Word
router.get("/:id/generar-word", auth, generarWord);

// Generar documento PDF
router.get("/:id/generar-pdf", auth, generarPDF);

export default router;
