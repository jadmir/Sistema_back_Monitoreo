import db from "../config/db.js";
import path from "path";
import fs from "fs";
import { generarDocumentoWord } from "../utils/wordGenerator.js";
import XLSX from "xlsx";

// Helper para formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  // Ajustar por zona horaria
  const offset = date.getTimezoneOffset();
  const dateLocal = new Date(date.getTime() + (offset * 60 * 1000));
  
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const dia = dateLocal.getDate();
  const mes = meses[dateLocal.getMonth()];
  const año = dateLocal.getFullYear();
  
  return `${dia} de ${mes} de ${año}`;
};

// CREAR CAPACITACIÓN ---------------------------------------
export const crearCapacitacion = async (req, res) => {
  try {
    const {
      cliente,
      direccion,
      cargo_departamento,
      fecha_instalacion,
      responsable_centro_salud,
      tipo_plantilla, // Nuevo: nombre de la plantilla a usar
      productos, // Array de {producto_id, numero_serie, version_software, internal_id}
      asistentes, // Array de {usuario_id?, nombre, tipo_asistente, firma?}
    } = req.body;

    const usuario_creador_id = req.user.id;
    const firma_responsable_centro = req.file
      ? `uploads/firmas/${req.file.filename}`
      : null;

    // Validar campos requeridos
    if (!cliente || !responsable_centro_salud) {
      return res
        .status(400)
        .json({ message: "Cliente y responsable son requeridos" });
    }

    // Insertar capacitación
    const [result] = await db.query(
      `INSERT INTO capacitaciones 
       (cliente, direccion, cargo_departamento, fecha_instalacion, 
        responsable_centro_salud, firma_responsable_centro, usuario_creador_id, tipo_plantilla) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente,
        direccion,
        cargo_departamento,
        fecha_instalacion,
        responsable_centro_salud,
        firma_responsable_centro,
        usuario_creador_id,
        tipo_plantilla || "plantilla_capacitacion.docx",
      ]
    );

    const capacitacion_id = result.insertId;

    // Insertar productos si existen
    if (productos && Array.isArray(productos) && productos.length > 0) {
      const productosValues = productos.map((p) => [
        capacitacion_id,
        p.producto_id,
        p.numero_serie || null,
        p.version_software || null,
        p.internal_id || null,
      ]);

      await db.query(
        `INSERT INTO capacitacion_productos 
         (capacitacion_id, producto_id, numero_serie, version_software, internal_id) 
         VALUES ?`,
        [productosValues]
      );
    }

    // Insertar asistentes si existen
    if (asistentes && Array.isArray(asistentes) && asistentes.length > 0) {
      const asistentesValues = asistentes.map((a) => [
        capacitacion_id,
        a.nombre,
        a.tipo_asistente || "profesional",
        a.firma || null,
        a.fecha || new Date(),
      ]);

      await db.query(
        `INSERT INTO asistencia 
         (capacitacion_id, nombre, tipo_asistente, firma, fecha) 
         VALUES ?`,
        [asistentesValues]
      );
    }

    res.json({
      message: "Capacitación creada correctamente",
      capacitacion_id,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al crear capacitación", error: err.message });
  }
};

// LISTAR CAPACITACIONES ---------------------------------------
export const listarCapacitaciones = async (req, res) => {
  try {
    const { 
      cliente, 
      fecha_desde, 
      fecha_hasta, 
      tipo_plantilla,
      responsable_drager_id 
    } = req.query;

    let query = `
      SELECT 
        c.id,
        c.cliente,
        c.direccion,
        c.cargo_departamento,
        c.fecha_instalacion,
        c.responsable_centro_salud,
        c.tipo_plantilla,
        c.fecha_creado,
        c.updated_at,
        u.id as responsable_drager_id,
        u.nombre as responsable_drager,
        u.email as responsable_drager_email
      FROM capacitaciones c
      JOIN usuarios u ON c.usuario_creador_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Filtro por cliente
    if (cliente) {
      query += ` AND c.cliente LIKE ?`;
      params.push(`%${cliente}%`);
    }

    // Filtro por rango de fechas
    if (fecha_desde) {
      query += ` AND c.fecha_instalacion >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND c.fecha_instalacion <= ?`;
      params.push(fecha_hasta);
    }

    // Filtro por tipo de plantilla
    if (tipo_plantilla) {
      query += ` AND c.tipo_plantilla = ?`;
      params.push(tipo_plantilla);
    }

    // Filtro por responsable Drager
    if (responsable_drager_id) {
      query += ` AND c.usuario_creador_id = ?`;
      params.push(responsable_drager_id);
    }

    query += ` ORDER BY c.fecha_creado DESC`;

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al listar capacitaciones", error: err.message });
  }
};

// OBTENER REPORTE COMPLETO DE CAPACITACIONES ---------------------------------------
export const obtenerReporteCapacitaciones = async (req, res) => {
  try {
    const { 
      cliente, 
      fecha_desde, 
      fecha_hasta, 
      tipo_plantilla,
      responsable_drager_id 
    } = req.query;

    let query = `
      SELECT 
        c.id,
        c.cliente,
        c.direccion,
        c.cargo_departamento,
        c.fecha_instalacion,
        c.responsable_centro_salud,
        c.tipo_plantilla,
        c.fecha_creado,
        u.nombre as responsable_drager,
        u.email as responsable_drager_email,
        COUNT(DISTINCT cp.id) as total_productos,
        COUNT(DISTINCT a.id) as total_asistentes
      FROM capacitaciones c
      JOIN usuarios u ON c.usuario_creador_id = u.id
      LEFT JOIN capacitacion_productos cp ON c.id = cp.capacitacion_id
      LEFT JOIN asistencia a ON c.id = a.capacitacion_id
      WHERE 1=1
    `;

    const params = [];

    if (cliente) {
      query += ` AND c.cliente LIKE ?`;
      params.push(`%${cliente}%`);
    }

    if (fecha_desde) {
      query += ` AND c.fecha_instalacion >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND c.fecha_instalacion <= ?`;
      params.push(fecha_hasta);
    }

    if (tipo_plantilla) {
      query += ` AND c.tipo_plantilla = ?`;
      params.push(tipo_plantilla);
    }

    if (responsable_drager_id) {
      query += ` AND c.usuario_creador_id = ?`;
      params.push(responsable_drager_id);
    }

    query += ` GROUP BY c.id ORDER BY c.fecha_creado DESC`;

    const [rows] = await db.query(query, params);

    res.json({
      total: rows.length,
      capacitaciones: rows
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener reporte", error: err.message });
  }
};

// OBTENER ESTADÍSTICAS DE CAPACITACIONES ---------------------------------------
export const obtenerEstadisticas = async (req, res) => {
  try {
    // Total de capacitaciones
    const [totalCap] = await db.query(`
      SELECT COUNT(*) as total FROM capacitaciones
    `);

    // Capacitaciones por tipo de plantilla
    const [porTipo] = await db.query(`
      SELECT 
        tipo_plantilla,
        COUNT(*) as total
      FROM capacitaciones
      GROUP BY tipo_plantilla
      ORDER BY total DESC
    `);

    // Capacitaciones por mes (últimos 12 meses)
    const [porMes] = await db.query(`
      SELECT 
        DATE_FORMAT(fecha_instalacion, '%Y-%m') as mes,
        COUNT(*) as total
      FROM capacitaciones
      WHERE fecha_instalacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha_instalacion, '%Y-%m')
      ORDER BY mes DESC
    `);

    // Top 5 clientes con más capacitaciones
    const [topClientes] = await db.query(`
      SELECT 
        cliente,
        COUNT(*) as total_capacitaciones
      FROM capacitaciones
      GROUP BY cliente
      ORDER BY total_capacitaciones DESC
      LIMIT 5
    `);

    // Capacitaciones por responsable Drager
    const [porResponsable] = await db.query(`
      SELECT 
        u.nombre as responsable,
        COUNT(c.id) as total_capacitaciones
      FROM usuarios u
      LEFT JOIN capacitaciones c ON u.id = c.usuario_creador_id
      GROUP BY u.id, u.nombre
      ORDER BY total_capacitaciones DESC
    `);

    res.json({
      total_capacitaciones: totalCap[0].total,
      por_tipo_plantilla: porTipo,
      por_mes: porMes,
      top_clientes: topClientes,
      por_responsable: porResponsable
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener estadísticas", error: err.message });
  }
};

// OBTENER CAPACITACIÓN POR ID ---------------------------------------
export const obtenerCapacitacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener capacitación
    const [capacitacion] = await db.query(
      `
      SELECT 
        c.*,
        u.nombre as responsable_drager,
        u.firma as firma_responsable_drager
      FROM capacitaciones c
      JOIN usuarios u ON c.usuario_creador_id = u.id
      WHERE c.id = ?
    `,
      [id]
    );

    if (capacitacion.length === 0) {
      return res.status(404).json({ message: "Capacitación no encontrada" });
    }

    // Obtener productos
    const [productos] = await db.query(
      `
      SELECT 
        cp.*,
        p.referencia,
        p.nombre as producto_nombre
      FROM capacitacion_productos cp
      JOIN productos p ON cp.producto_id = p.id
      WHERE cp.capacitacion_id = ?
    `,
      [id]
    );

    // Obtener asistentes
    const [asistentes] = await db.query(
      `
      SELECT id, capacitacion_id, nombre, tipo_asistente, firma, fecha
      FROM asistencia
      WHERE capacitacion_id = ?
    `,
      [id]
    );

    res.json({
      ...capacitacion[0],
      productos,
      asistentes,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener capacitación",
      error: err.message,
    });
  }
};

// LISTAR PLANTILLAS DISPONIBLES -----------------------------------
export const listarPlantillas = async (req, res) => {
  try {
    const templateDir = path.join(process.cwd(), "src", "templates");
    const files = fs.readdirSync(templateDir);
    const plantillas = files
      .filter(file => file.endsWith('.docx'))
      .map(file => ({
        nombre: file,
        nombre_display: file.replace('.docx', '').replace(/_/g, ' ')
      }));
    
    res.json(plantillas);
  } catch (err) {
    res.status(500).json({ message: "Error al listar plantillas", error: err.message });
  }
};

// GENERAR DOCUMENTO WORD DE PRUEBA ---------------------------------------
export const generarWordPrueba = async (req, res) => {
  try {
    console.log("Iniciando generación de Word...");
    
    // Datos de prueba
    const data = {
      cliente: "Hospital General de Prueba",
      direccion: "Av. Principal 123, Ciudad",
      cargo_departamento: "Departamento de Anestesiología",
      fecha_instalacion: formatearFecha("2025-11-17"),
      responsable_centro_salud: "Dr. Juan Pérez García",
      responsable_drager: "Ing. María López",
      productos: [
        {
          referencia: "MK06000",
          nombre: "Maquina de anestesia - Modelo Perseus A500",
          numero_serie: "SN123456",
          version_software: "v2.0.1",
          internal_id: "ID001",
        },
        {
          referencia: "8621600",
          nombre: "Maquina de anestesia - Modelo Atlan A350XL",
          numero_serie: "SN789012",
          version_software: "v1.5.3",
          internal_id: "ID002",
        },
      ],
      asistentes: [
        { nombre: "Carlos Ramírez" },
        { nombre: "Ana Torres" },
        { nombre: "Pedro Sánchez" },
      ],
    };

    console.log("Datos preparados:", JSON.stringify(data, null, 2));

    // Generar documento
    console.log("Generando documento...");
    const buffer = await generarDocumentoWord(data);
    console.log("Documento generado. Tamaño del buffer:", buffer.length);

    // Guardar temporalmente en el servidor
    const outputPath = path.join(process.cwd(), "src", "uploads", "capacitacion_prueba.docx");
    console.log("Guardando en:", outputPath);
    fs.writeFileSync(outputPath, buffer);
    console.log("Archivo guardado exitosamente");

    // Enviar archivo con descarga forzada
    const filename = `capacitacion_prueba_${Date.now()}.docx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", buffer.length);
    res.end(buffer, "binary");
  } catch (err) {
    console.error("ERROR COMPLETO:", err);
    console.error("Stack:", err.stack);
    if (err.properties) {
      console.error("Propiedades del error:", JSON.stringify(err.properties, null, 2));
    }
    res
      .status(500)
      .json({ 
        message: "Error al generar documento", 
        error: err.message,
        stack: err.stack,
        properties: err.properties
      });
  }
};

// GENERAR DOCUMENTO WORD ---------------------------------------
export const generarWord = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener capacitación completa
    const [capacitacion] = await db.query(
      `
      SELECT 
        c.*,
        u.nombre as responsable_drager,
        u.firma as firma_responsable_drager
      FROM capacitaciones c
      JOIN usuarios u ON c.usuario_creador_id = u.id
      WHERE c.id = ?
    `,
      [id]
    );

    if (capacitacion.length === 0) {
      return res.status(404).json({ message: "Capacitación no encontrada" });
    }

    // Obtener productos
    const [productos] = await db.query(
      `
      SELECT 
        cp.*,
        p.referencia,
        p.nombre as producto_nombre
      FROM capacitacion_productos cp
      JOIN productos p ON cp.producto_id = p.id
      WHERE cp.capacitacion_id = ?
    `,
      [id]
    );

    // Obtener asistentes
    const [asistentes] = await db.query(
      `
      SELECT id, capacitacion_id, nombre, tipo_asistente, firma, fecha
      FROM asistencia
      WHERE capacitacion_id = ?
    `,
      [id]
    );

    const data = {
      ...capacitacion[0],
      fecha_instalacion: formatearFecha(capacitacion[0].fecha_instalacion),
      responsable_drager: capacitacion[0].responsable_drager,
      firma_responsable_drager: capacitacion[0].firma_responsable_drager,
      productos: productos.map((p) => ({
        referencia: p.referencia,
        nombre: p.producto_nombre,
        numero_serie: p.numero_serie || "",
        version_software: p.version_software || "",
        internal_id: p.internal_id || "",
      })),
      asistentes: asistentes.map((a) => ({
        nombre: a.nombre,
        fecha: formatearFecha(a.fecha),
        firma: a.firma || "",
      })),
    };

    // Usar la plantilla específica de esta capacitación
    const nombrePlantilla = capacitacion[0].tipo_plantilla || "plantilla_capacitacion.docx";
    
    // Generar documento
    console.log("Generando Word con plantilla:", nombrePlantilla);
    console.log("Firma responsable drager:", data.firma_responsable_drager);
    console.log("Firma responsable centro:", data.firma_responsable_centro);
    const buffer = await generarDocumentoWord(data, nombrePlantilla);

    // Guardar temporalmente para descarga posterior
    const outputPath = path.join(process.cwd(), "src", "uploads", `capacitacion_${id}.docx`);
    fs.writeFileSync(outputPath, buffer);

    // Enviar archivo con descarga forzada
    const filename = `capacitacion_${id}.docx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", buffer.length);
    res.end(buffer, "binary");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al generar documento", error: err.message });
  }
};

// GENERAR DOCUMENTO PDF (usando el Word generado) ---------------
export const generarPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero generar el Word
    const wordPath = path.join(process.cwd(), "src", "uploads", `capacitacion_${id}.docx`);
    
    // Si no existe, generarlo primero
    if (!fs.existsSync(wordPath)) {
      // Generar el Word primero (código duplicado pero necesario)
      const [capacitacion] = await db.query(
        `SELECT c.*, u.nombre as responsable_drager, u.firma as firma_responsable_drager
         FROM capacitaciones c
         JOIN usuarios u ON c.usuario_creador_id = u.id
         WHERE c.id = ?`,
        [id]
      );

      if (capacitacion.length === 0) {
        return res.status(404).json({ message: "Capacitación no encontrada" });
      }

      const [productos] = await db.query(
        `SELECT cp.*, p.referencia, p.nombre as producto_nombre
         FROM capacitacion_productos cp
         JOIN productos p ON cp.producto_id = p.id
         WHERE cp.capacitacion_id = ?`,
        [id]
      );

      const [asistentes] = await db.query(
        `SELECT id, capacitacion_id, nombre, tipo_asistente, firma, fecha
         FROM asistencia
         WHERE capacitacion_id = ?`,
        [id]
      );

      const data = {
        ...capacitacion[0],
        firma_responsable_drager: capacitacion[0].firma_responsable_drager,
        productos: productos.map((p) => ({
          referencia: p.referencia,
          nombre: p.producto_nombre,
          numero_serie: p.numero_serie || "",
          version_software: p.version_software || "",
          internal_id: p.internal_id || "",
        })),
        asistentes: asistentes.map((a) => ({
          nombre: a.nombre,
          fecha: a.fecha,
          firma: a.firma || "",
        })),
      };

      const nombrePlantilla = capacitacion[0].tipo_plantilla || "plantilla_capacitacion.docx";
      const buffer = await generarDocumentoWord(data, nombrePlantilla);
      fs.writeFileSync(wordPath, buffer);
    }

    // Enviar mensaje indicando que debe convertirse manualmente
    res.json({
      message: "Para generar PDF, descarga primero el Word y conviértelo",
      word_url: `/api/capacitaciones/${id}/generar-word`,
      nota: "Puedes usar Microsoft Word, LibreOffice o un convertidor online para generar el PDF"
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al procesar PDF", error: err.message });
  }
};

// EXPORTAR REPORTE A EXCEL ---------------------------------------
export const exportarReporteExcel = async (req, res) => {
  try {
    const { 
      cliente, 
      fecha_desde, 
      fecha_hasta, 
      tipo_plantilla,
      responsable_drager_id 
    } = req.query;

    let query = `
      SELECT 
        c.id,
        c.cliente,
        c.direccion,
        c.cargo_departamento,
        c.fecha_instalacion,
        c.responsable_centro_salud,
        c.tipo_plantilla,
        c.fecha_creado,
        u.nombre as responsable_drager,
        u.email as responsable_drager_email,
        COUNT(DISTINCT cp.id) as total_productos,
        COUNT(DISTINCT a.id) as total_asistentes
      FROM capacitaciones c
      JOIN usuarios u ON c.usuario_creador_id = u.id
      LEFT JOIN capacitacion_productos cp ON c.id = cp.capacitacion_id
      LEFT JOIN asistencia a ON c.id = a.capacitacion_id
      WHERE 1=1
    `;

    const params = [];

    if (cliente) {
      query += ` AND c.cliente LIKE ?`;
      params.push(`%${cliente}%`);
    }

    if (fecha_desde) {
      query += ` AND c.fecha_instalacion >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND c.fecha_instalacion <= ?`;
      params.push(fecha_hasta);
    }

    if (tipo_plantilla) {
      query += ` AND c.tipo_plantilla = ?`;
      params.push(tipo_plantilla);
    }

    if (responsable_drager_id) {
      query += ` AND c.usuario_creador_id = ?`;
      params.push(responsable_drager_id);
    }

    query += ` GROUP BY c.id ORDER BY c.fecha_creado DESC`;

    const [capacitaciones] = await db.query(query, params);

    // Preparar datos para Excel con formato bonito
    const datosExcel = capacitaciones.map((cap, index) => ({
      '#': index + 1,
      'ID': cap.id,
      'Cliente': cap.cliente,
      'Dirección': cap.direccion || '',
      'Cargo/Departamento': cap.cargo_departamento || '',
      'Fecha Instalación': cap.fecha_instalacion ? new Date(cap.fecha_instalacion).toLocaleDateString('es-ES') : '',
      'Responsable Centro': cap.responsable_centro_salud,
      'Responsable Drager': cap.responsable_drager,
      'Email Drager': cap.responsable_drager_email,
      'Tipo Plantilla': cap.tipo_plantilla.replace('.docx', ''),
      'Total Productos': cap.total_productos,
      'Total Asistentes': cap.total_asistentes,
      'Fecha Creación': new Date(cap.fecha_creado).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    // Crear worksheet
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Configurar anchos de columna para mejor visualización
    worksheet['!cols'] = [
      { wch: 5 },  // #
      { wch: 6 },  // ID
      { wch: 30 }, // Cliente
      { wch: 35 }, // Dirección
      { wch: 25 }, // Cargo/Departamento
      { wch: 18 }, // Fecha Instalación
      { wch: 25 }, // Responsable Centro
      { wch: 20 }, // Responsable Drager
      { wch: 30 }, // Email Drager
      { wch: 20 }, // Tipo Plantilla
      { wch: 15 }, // Total Productos
      { wch: 15 }, // Total Asistentes
      { wch: 20 }  // Fecha Creación
    ];

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Capacitaciones');

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `reporte_capacitaciones_${fecha}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (err) {
    console.error('Error al generar Excel:', err);
    res.status(500).json({ message: "Error al generar reporte Excel", error: err.message });
  }
};

// EXPORTAR REPORTE COMPLETO A EXCEL (con múltiples hojas) ---------------------------------------
export const exportarReporteCompletoExcel = async (req, res) => {
  try {
    const { 
      cliente, 
      fecha_desde, 
      fecha_hasta, 
      tipo_plantilla,
      responsable_drager_id 
    } = req.query;

    let query = `
      SELECT 
        c.id,
        c.cliente,
        c.direccion,
        c.cargo_departamento,
        c.fecha_instalacion,
        c.responsable_centro_salud,
        c.tipo_plantilla,
        c.fecha_creado,
        u.nombre as responsable_drager,
        u.email as responsable_drager_email,
        COUNT(DISTINCT cp.id) as total_productos,
        COUNT(DISTINCT a.id) as total_asistentes
      FROM capacitaciones c
      JOIN usuarios u ON c.usuario_creador_id = u.id
      LEFT JOIN capacitacion_productos cp ON c.id = cp.capacitacion_id
      LEFT JOIN asistencia a ON c.id = a.capacitacion_id
      WHERE 1=1
    `;

    const params = [];

    if (cliente) {
      query += ` AND c.cliente LIKE ?`;
      params.push(`%${cliente}%`);
    }

    if (fecha_desde) {
      query += ` AND c.fecha_instalacion >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND c.fecha_instalacion <= ?`;
      params.push(fecha_hasta);
    }

    if (tipo_plantilla) {
      query += ` AND c.tipo_plantilla = ?`;
      params.push(tipo_plantilla);
    }

    if (responsable_drager_id) {
      query += ` AND c.usuario_creador_id = ?`;
      params.push(responsable_drager_id);
    }

    query += ` GROUP BY c.id ORDER BY c.fecha_creado DESC`;

    const [capacitaciones] = await db.query(query, params);

    // HOJA 1: Datos principales
    const datosCapacitaciones = capacitaciones.map((cap, index) => ({
      '#': index + 1,
      'ID': cap.id,
      'Cliente': cap.cliente,
      'Dirección': cap.direccion || '',
      'Cargo/Departamento': cap.cargo_departamento || '',
      'Fecha Instalación': cap.fecha_instalacion ? new Date(cap.fecha_instalacion).toLocaleDateString('es-ES') : '',
      'Responsable Centro': cap.responsable_centro_salud,
      'Responsable Drager': cap.responsable_drager,
      'Email Drager': cap.responsable_drager_email,
      'Tipo Plantilla': cap.tipo_plantilla.replace('.docx', ''),
      'Total Productos': cap.total_productos,
      'Total Asistentes': cap.total_asistentes,
      'Fecha Creación': new Date(cap.fecha_creado).toLocaleDateString('es-ES')
    }));

    const ws1 = XLSX.utils.json_to_sheet(datosCapacitaciones);
    ws1['!cols'] = [
      { wch: 5 }, { wch: 6 }, { wch: 30 }, { wch: 35 }, { wch: 25 },
      { wch: 18 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];

    // HOJA 2: Resumen por cliente
    const resumenClientes = {};
    capacitaciones.forEach(cap => {
      if (!resumenClientes[cap.cliente]) {
        resumenClientes[cap.cliente] = {
          'Cliente': cap.cliente,
          'Total Capacitaciones': 0,
          'Total Productos': 0,
          'Total Asistentes': 0
        };
      }
      resumenClientes[cap.cliente]['Total Capacitaciones']++;
      resumenClientes[cap.cliente]['Total Productos'] += parseInt(cap.total_productos);
      resumenClientes[cap.cliente]['Total Asistentes'] += parseInt(cap.total_asistentes);
    });

    const datosResumen = Object.values(resumenClientes);
    const ws2 = XLSX.utils.json_to_sheet(datosResumen);
    ws2['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    // HOJA 3: Resumen por responsable
    const resumenResponsables = {};
    capacitaciones.forEach(cap => {
      if (!resumenResponsables[cap.responsable_drager]) {
        resumenResponsables[cap.responsable_drager] = {
          'Responsable': cap.responsable_drager,
          'Email': cap.responsable_drager_email,
          'Total Capacitaciones': 0,
          'Total Productos': 0,
          'Total Asistentes': 0
        };
      }
      resumenResponsables[cap.responsable_drager]['Total Capacitaciones']++;
      resumenResponsables[cap.responsable_drager]['Total Productos'] += parseInt(cap.total_productos);
      resumenResponsables[cap.responsable_drager]['Total Asistentes'] += parseInt(cap.total_asistentes);
    });

    const datosResponsables = Object.values(resumenResponsables);
    const ws3 = XLSX.utils.json_to_sheet(datosResponsables);
    ws3['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    // Crear workbook con múltiples hojas
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws1, 'Capacitaciones');
    XLSX.utils.book_append_sheet(workbook, ws2, 'Por Cliente');
    XLSX.utils.book_append_sheet(workbook, ws3, 'Por Responsable');

    // Generar buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `reporte_completo_${fecha}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (err) {
    console.error('Error al generar Excel completo:', err);
    res.status(500).json({ message: "Error al generar reporte completo", error: err.message });
  }
};
