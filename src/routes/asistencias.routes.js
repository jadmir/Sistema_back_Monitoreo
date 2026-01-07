import { Router } from "express";
import {
  listarAsistencias,
  obtenerReporteAsistencias,
  obtenerEstadisticasAsistencias,
  exportarAsistenciasExcel,
  exportarAsistenciasCompletoExcel
} from "../controllers/asistencias.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Obtener estadísticas
router.get("/estadisticas", auth, obtenerEstadisticasAsistencias);

// Exportar a Excel (simple)
router.get("/exportar-excel", auth, exportarAsistenciasExcel);

// Exportar a Excel completo (múltiples hojas)
router.get("/exportar-excel-completo", auth, exportarAsistenciasCompletoExcel);

// Obtener reporte completo (JSON)
router.get("/reporte", auth, obtenerReporteAsistencias);

// Listar asistencias (con filtros)
router.get("/", auth, listarAsistencias);

export default router;
