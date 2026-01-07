import db from "../config/db.js";
import XLSX from "xlsx";

// LISTAR ASISTENCIAS CON FILTROS ---------------------------------------
export const listarAsistencias = async (req, res) => {
  try {
    const { 
      capacitacion_id, 
      tipo_asistente,
      fecha_desde,
      fecha_hasta,
      nombre
    } = req.query;

    let query = `
      SELECT 
        a.id,
        a.capacitacion_id,
        a.nombre,
        a.tipo_asistente,
        a.firma,
        a.fecha,
        a.created_at,
        c.cliente,
        c.responsable_centro_salud,
        c.fecha_instalacion,
        c.tipo_plantilla,
        u.nombre as responsable_drager
      FROM asistencia a
      INNER JOIN capacitaciones c ON a.capacitacion_id = c.id
      INNER JOIN usuarios u ON c.usuario_creador_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (capacitacion_id) {
      query += ` AND a.capacitacion_id = ?`;
      params.push(capacitacion_id);
    }

    if (tipo_asistente) {
      query += ` AND a.tipo_asistente = ?`;
      params.push(tipo_asistente);
    }

    if (fecha_desde) {
      query += ` AND a.fecha >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND a.fecha <= ?`;
      params.push(fecha_hasta);
    }

    if (nombre) {
      query += ` AND a.nombre LIKE ?`;
      params.push(`%${nombre}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [asistencias] = await db.query(query, params);

    res.json(asistencias);
  } catch (err) {
    console.error('Error al listar asistencias:', err);
    res.status(500).json({ message: "Error al listar asistencias", error: err.message });
  }
};

// OBTENER REPORTE DE ASISTENCIAS ---------------------------------------
export const obtenerReporteAsistencias = async (req, res) => {
  try {
    const { 
      capacitacion_id, 
      tipo_asistente,
      fecha_desde,
      fecha_hasta,
      nombre
    } = req.query;

    let query = `
      SELECT 
        a.id,
        a.capacitacion_id,
        a.nombre,
        a.tipo_asistente,
        a.fecha,
        a.created_at,
        c.id as cap_id,
        c.cliente,
        c.direccion,
        c.cargo_departamento,
        c.responsable_centro_salud,
        c.fecha_instalacion,
        c.tipo_plantilla,
        u.nombre as responsable_drager,
        u.email as responsable_drager_email,
        COUNT(DISTINCT cp.id) as productos_capacitacion
      FROM asistencia a
      INNER JOIN capacitaciones c ON a.capacitacion_id = c.id
      INNER JOIN usuarios u ON c.usuario_creador_id = u.id
      LEFT JOIN capacitacion_productos cp ON c.id = cp.capacitacion_id
      WHERE 1=1
    `;

    const params = [];

    if (capacitacion_id) {
      query += ` AND a.capacitacion_id = ?`;
      params.push(capacitacion_id);
    }

    if (tipo_asistente) {
      query += ` AND a.tipo_asistente = ?`;
      params.push(tipo_asistente);
    }

    if (fecha_desde) {
      query += ` AND a.fecha >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND a.fecha <= ?`;
      params.push(fecha_hasta);
    }

    if (nombre) {
      query += ` AND a.nombre LIKE ?`;
      params.push(`%${nombre}%`);
    }

    query += ` GROUP BY a.id ORDER BY a.created_at DESC`;

    const [asistencias] = await db.query(query, params);

    res.json({
      total: asistencias.length,
      asistencias: asistencias
    });
  } catch (err) {
    console.error('Error al obtener reporte de asistencias:', err);
    res.status(500).json({ message: "Error al obtener reporte", error: err.message });
  }
};

// OBTENER ESTADÍSTICAS DE ASISTENCIAS ---------------------------------------
export const obtenerEstadisticasAsistencias = async (req, res) => {
  try {
    // Total de asistencias
    const [totalAsis] = await db.query(`
      SELECT COUNT(*) as total FROM asistencia
    `);

    // Asistencias por tipo
    const [porTipo] = await db.query(`
      SELECT 
        tipo_asistente,
        COUNT(*) as total
      FROM asistencia
      GROUP BY tipo_asistente
      ORDER BY total DESC
    `);

    // Asistencias por mes (últimos 12 meses)
    const [porMes] = await db.query(`
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        COUNT(*) as total,
        COUNT(CASE WHEN tipo_asistente = 'tecnico' THEN 1 END) as tecnicos,
        COUNT(CASE WHEN tipo_asistente = 'profesional' THEN 1 END) as profesionales
      FROM asistencia
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes DESC
    `);

    // Top 10 asistentes más frecuentes
    const [topAsistentes] = await db.query(`
      SELECT 
        nombre,
        tipo_asistente,
        COUNT(*) as total_asistencias
      FROM asistencia
      GROUP BY nombre, tipo_asistente
      ORDER BY total_asistencias DESC
      LIMIT 10
    `);

    // Asistencias por capacitación (con cliente)
    const [porCapacitacion] = await db.query(`
      SELECT 
        c.id as capacitacion_id,
        c.cliente,
        c.fecha_instalacion,
        COUNT(a.id) as total_asistentes,
        COUNT(CASE WHEN a.tipo_asistente = 'tecnico' THEN 1 END) as tecnicos,
        COUNT(CASE WHEN a.tipo_asistente = 'profesional' THEN 1 END) as profesionales
      FROM capacitaciones c
      LEFT JOIN asistencia a ON c.id = a.capacitacion_id
      GROUP BY c.id
      HAVING total_asistentes > 0
      ORDER BY total_asistentes DESC
      LIMIT 10
    `);

    // Promedio de asistentes por capacitación
    const [promedio] = await db.query(`
      SELECT 
        AVG(asistentes_count) as promedio_asistentes
      FROM (
        SELECT 
          capacitacion_id,
          COUNT(*) as asistentes_count
        FROM asistencia
        GROUP BY capacitacion_id
      ) as subquery
    `);

    res.json({
      total_asistencias: totalAsis[0].total,
      por_tipo: porTipo,
      por_mes: porMes,
      top_asistentes: topAsistentes,
      por_capacitacion: porCapacitacion,
      promedio_por_capacitacion: Math.round(promedio[0].promedio_asistentes * 10) / 10
    });
  } catch (err) {
    console.error('Error al obtener estadísticas de asistencias:', err);
    res.status(500).json({ message: "Error al obtener estadísticas", error: err.message });
  }
};

// EXPORTAR ASISTENCIAS A EXCEL ---------------------------------------
export const exportarAsistenciasExcel = async (req, res) => {
  try {
    const { 
      capacitacion_id, 
      tipo_asistente,
      fecha_desde,
      fecha_hasta,
      nombre
    } = req.query;

    let query = `
      SELECT 
        a.id,
        a.capacitacion_id,
        a.nombre,
        a.tipo_asistente,
        a.fecha,
        a.created_at,
        c.cliente,
        c.direccion,
        c.responsable_centro_salud,
        c.fecha_instalacion,
        c.tipo_plantilla,
        u.nombre as responsable_drager,
        u.email as responsable_drager_email
      FROM asistencia a
      INNER JOIN capacitaciones c ON a.capacitacion_id = c.id
      INNER JOIN usuarios u ON c.usuario_creador_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (capacitacion_id) {
      query += ` AND a.capacitacion_id = ?`;
      params.push(capacitacion_id);
    }

    if (tipo_asistente) {
      query += ` AND a.tipo_asistente = ?`;
      params.push(tipo_asistente);
    }

    if (fecha_desde) {
      query += ` AND a.fecha >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND a.fecha <= ?`;
      params.push(fecha_hasta);
    }

    if (nombre) {
      query += ` AND a.nombre LIKE ?`;
      params.push(`%${nombre}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [asistencias] = await db.query(query, params);

    // Preparar datos para Excel
    const datosExcel = asistencias.map((asis, index) => ({
      '#': index + 1,
      'ID': asis.id,
      'ID Capacitación': asis.capacitacion_id,
      'Nombre Asistente': asis.nombre,
      'Tipo': asis.tipo_asistente.toUpperCase(),
      'Fecha Asistencia': asis.fecha ? new Date(asis.fecha).toLocaleDateString('es-ES') : '',
      'Cliente': asis.cliente,
      'Dirección': asis.direccion || '',
      'Responsable Centro': asis.responsable_centro_salud,
      'Fecha Instalación': asis.fecha_instalacion ? new Date(asis.fecha_instalacion).toLocaleDateString('es-ES') : '',
      'Tipo Plantilla': asis.tipo_plantilla.replace('.docx', ''),
      'Responsable Drager': asis.responsable_drager,
      'Email Drager': asis.responsable_drager_email,
      'Fecha Registro': new Date(asis.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    // Crear worksheet
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 5 },  // #
      { wch: 6 },  // ID
      { wch: 15 }, // ID Capacitación
      { wch: 30 }, // Nombre Asistente
      { wch: 15 }, // Tipo
      { wch: 18 }, // Fecha Asistencia
      { wch: 30 }, // Cliente
      { wch: 35 }, // Dirección
      { wch: 25 }, // Responsable Centro
      { wch: 18 }, // Fecha Instalación
      { wch: 20 }, // Tipo Plantilla
      { wch: 20 }, // Responsable Drager
      { wch: 30 }, // Email Drager
      { wch: 20 }  // Fecha Registro
    ];

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');

    // Generar buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `reporte_asistencias_${fecha}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (err) {
    console.error('Error al generar Excel de asistencias:', err);
    res.status(500).json({ message: "Error al generar reporte Excel", error: err.message });
  }
};

// EXPORTAR REPORTE COMPLETO DE ASISTENCIAS A EXCEL (múltiples hojas) ---------------------------------------
export const exportarAsistenciasCompletoExcel = async (req, res) => {
  try {
    const { 
      capacitacion_id, 
      tipo_asistente,
      fecha_desde,
      fecha_hasta,
      nombre
    } = req.query;

    let query = `
      SELECT 
        a.id,
        a.capacitacion_id,
        a.nombre,
        a.tipo_asistente,
        a.fecha,
        a.created_at,
        c.cliente,
        c.direccion,
        c.responsable_centro_salud,
        c.fecha_instalacion,
        c.tipo_plantilla,
        u.nombre as responsable_drager,
        u.email as responsable_drager_email
      FROM asistencia a
      INNER JOIN capacitaciones c ON a.capacitacion_id = c.id
      INNER JOIN usuarios u ON c.usuario_creador_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (capacitacion_id) {
      query += ` AND a.capacitacion_id = ?`;
      params.push(capacitacion_id);
    }

    if (tipo_asistente) {
      query += ` AND a.tipo_asistente = ?`;
      params.push(tipo_asistente);
    }

    if (fecha_desde) {
      query += ` AND a.fecha >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND a.fecha <= ?`;
      params.push(fecha_hasta);
    }

    if (nombre) {
      query += ` AND a.nombre LIKE ?`;
      params.push(`%${nombre}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [asistencias] = await db.query(query, params);

    // HOJA 1: Datos principales
    const datosAsistencias = asistencias.map((asis, index) => ({
      '#': index + 1,
      'ID': asis.id,
      'ID Capacitación': asis.capacitacion_id,
      'Nombre Asistente': asis.nombre,
      'Tipo': asis.tipo_asistente.toUpperCase(),
      'Fecha Asistencia': asis.fecha ? new Date(asis.fecha).toLocaleDateString('es-ES') : '',
      'Cliente': asis.cliente,
      'Responsable Centro': asis.responsable_centro_salud,
      'Fecha Instalación': asis.fecha_instalacion ? new Date(asis.fecha_instalacion).toLocaleDateString('es-ES') : '',
      'Responsable Drager': asis.responsable_drager,
      'Tipo Plantilla': asis.tipo_plantilla.replace('.docx', '')
    }));

    const ws1 = XLSX.utils.json_to_sheet(datosAsistencias);
    ws1['!cols'] = [
      { wch: 5 }, { wch: 6 }, { wch: 15 }, { wch: 30 }, { wch: 15 },
      { wch: 18 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 20 }, { wch: 20 }
    ];

    // HOJA 2: Resumen por tipo de asistente
    const resumenTipo = {
      'tecnico': { 'Tipo': 'TÉCNICO', 'Total': 0, 'Clientes Distintos': new Set() },
      'profesional': { 'Tipo': 'PROFESIONAL', 'Total': 0, 'Clientes Distintos': new Set() }
    };

    asistencias.forEach(asis => {
      if (resumenTipo[asis.tipo_asistente]) {
        resumenTipo[asis.tipo_asistente]['Total']++;
        resumenTipo[asis.tipo_asistente]['Clientes Distintos'].add(asis.cliente);
      }
    });

    const datosTipo = Object.values(resumenTipo).map(item => ({
      'Tipo': item.Tipo,
      'Total Asistencias': item.Total,
      'Clientes Distintos': item['Clientes Distintos'].size
    }));

    const ws2 = XLSX.utils.json_to_sheet(datosTipo);
    ws2['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];

    // HOJA 3: Resumen por cliente
    const resumenClientes = {};
    asistencias.forEach(asis => {
      if (!resumenClientes[asis.cliente]) {
        resumenClientes[asis.cliente] = {
          'Cliente': asis.cliente,
          'Total Asistentes': 0,
          'Técnicos': 0,
          'Profesionales': 0
        };
      }
      resumenClientes[asis.cliente]['Total Asistentes']++;
      if (asis.tipo_asistente === 'tecnico') {
        resumenClientes[asis.cliente]['Técnicos']++;
      } else if (asis.tipo_asistente === 'profesional') {
        resumenClientes[asis.cliente]['Profesionales']++;
      }
    });

    const datosClientes = Object.values(resumenClientes);
    const ws3 = XLSX.utils.json_to_sheet(datosClientes);
    ws3['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];

    // HOJA 4: Top asistentes frecuentes
    const frecuenciaAsistentes = {};
    asistencias.forEach(asis => {
      const key = `${asis.nombre}_${asis.tipo_asistente}`;
      if (!frecuenciaAsistentes[key]) {
        frecuenciaAsistentes[key] = {
          'Nombre': asis.nombre,
          'Tipo': asis.tipo_asistente.toUpperCase(),
          'Veces Asistido': 0,
          'Última Asistencia': asis.fecha
        };
      }
      frecuenciaAsistentes[key]['Veces Asistido']++;
      if (new Date(asis.fecha) > new Date(frecuenciaAsistentes[key]['Última Asistencia'])) {
        frecuenciaAsistentes[key]['Última Asistencia'] = asis.fecha;
      }
    });

    const datosTop = Object.values(frecuenciaAsistentes)
      .sort((a, b) => b['Veces Asistido'] - a['Veces Asistido'])
      .slice(0, 20)
      .map(item => ({
        ...item,
        'Última Asistencia': new Date(item['Última Asistencia']).toLocaleDateString('es-ES')
      }));

    const ws4 = XLSX.utils.json_to_sheet(datosTop);
    ws4['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];

    // Crear workbook con múltiples hojas
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws1, 'Asistencias');
    XLSX.utils.book_append_sheet(workbook, ws2, 'Por Tipo');
    XLSX.utils.book_append_sheet(workbook, ws3, 'Por Cliente');
    XLSX.utils.book_append_sheet(workbook, ws4, 'Top Asistentes');

    // Generar buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `reporte_asistencias_completo_${fecha}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (err) {
    console.error('Error al generar Excel completo de asistencias:', err);
    res.status(500).json({ message: "Error al generar reporte completo", error: err.message });
  }
};
