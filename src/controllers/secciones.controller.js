import db from "../config/db.js";

// LISTAR TODAS LAS SECCIONES ---------------------------------------
export const listarSecciones = async (req, res) => {
  try {
    const [secciones] = await db.query(
      `SELECT id, nombre 
       FROM secciones 
       ORDER BY nombre ASC`
    );

    res.json(secciones);
  } catch (error) {
    console.error("Error al listar secciones:", error);
    res.status(500).json({ message: "Error al listar secciones" });
  }
};

// OBTENER SECCIÓN POR ID ---------------------------------------
export const obtenerSeccion = async (req, res) => {
  try {
    const { id } = req.params;

    const [secciones] = await db.query(
      `SELECT id, nombre 
       FROM secciones 
       WHERE id = ?`,
      [id]
    );

    if (secciones.length === 0) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }

    res.json(secciones[0]);
  } catch (error) {
    console.error("Error al obtener sección:", error);
    res.status(500).json({ message: "Error al obtener sección" });
  }
};

// CREAR SECCIÓN ---------------------------------------
export const crearSeccion = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validar campo requerido
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    // Verificar si ya existe una sección con ese nombre
    const [existente] = await db.query(
      `SELECT id FROM secciones WHERE nombre = ?`,
      [nombre.trim().toUpperCase()]
    );

    if (existente.length > 0) {
      return res.status(400).json({ message: "Ya existe una sección con ese nombre" });
    }

    // Insertar nueva sección
    const [result] = await db.query(
      `INSERT INTO secciones (nombre) VALUES (?)`,
      [nombre.trim().toUpperCase()]
    );

    res.status(201).json({
      message: "Sección creada exitosamente",
      id: result.insertId,
      nombre: nombre.trim().toUpperCase()
    });
  } catch (error) {
    console.error("Error al crear sección:", error);
    res.status(500).json({ message: "Error al crear sección" });
  }
};

// ACTUALIZAR SECCIÓN ---------------------------------------
export const actualizarSeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Validar campo requerido
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    // Verificar si la sección existe
    const [seccionExistente] = await db.query(
      `SELECT id FROM secciones WHERE id = ?`,
      [id]
    );

    if (seccionExistente.length === 0) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }

    // Verificar si ya existe otra sección con ese nombre
    const [nombreDuplicado] = await db.query(
      `SELECT id FROM secciones WHERE nombre = ? AND id != ?`,
      [nombre.trim().toUpperCase(), id]
    );

    if (nombreDuplicado.length > 0) {
      return res.status(400).json({ message: "Ya existe otra sección con ese nombre" });
    }

    // Actualizar sección
    await db.query(
      `UPDATE secciones SET nombre = ? WHERE id = ?`,
      [nombre.trim().toUpperCase(), id]
    );

    res.json({
      message: "Sección actualizada exitosamente",
      id: parseInt(id),
      nombre: nombre.trim().toUpperCase()
    });
  } catch (error) {
    console.error("Error al actualizar sección:", error);
    res.status(500).json({ message: "Error al actualizar sección" });
  }
};

// ELIMINAR SECCIÓN ---------------------------------------
export const eliminarSeccion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la sección existe
    const [seccionExistente] = await db.query(
      `SELECT id, nombre FROM secciones WHERE id = ?`,
      [id]
    );

    if (seccionExistente.length === 0) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }

    // Verificar si hay productos asociados a esta sección
    const [productosAsociados] = await db.query(
      `SELECT COUNT(*) as total FROM productos WHERE seccion_id = ?`,
      [id]
    );

    if (productosAsociados[0].total > 0) {
      return res.status(400).json({
        message: `No se puede eliminar la sección "${seccionExistente[0].nombre}" porque tiene ${productosAsociados[0].total} producto(s) asociado(s)`,
        productosAsociados: productosAsociados[0].total
      });
    }

    // Eliminar sección
    await db.query(`DELETE FROM secciones WHERE id = ?`, [id]);

    res.json({
      message: "Sección eliminada exitosamente",
      nombre: seccionExistente[0].nombre
    });
  } catch (error) {
    console.error("Error al eliminar sección:", error);
    res.status(500).json({ message: "Error al eliminar sección" });
  }
};

// OBTENER PRODUCTOS DE UNA SECCIÓN ---------------------------------------
export const obtenerProductosDeSeccion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la sección existe
    const [seccionExistente] = await db.query(
      `SELECT id, nombre FROM secciones WHERE id = ?`,
      [id]
    );

    if (seccionExistente.length === 0) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }

    // Obtener productos de la sección
    const [productos] = await db.query(
      `SELECT id, seccion_id, codigo, nombre 
       FROM productos 
       WHERE seccion_id = ? 
       ORDER BY nombre ASC`,
      [id]
    );

    res.json({
      seccion: seccionExistente[0],
      productos: productos,
      total: productos.length
    });
  } catch (error) {
    console.error("Error al obtener productos de la sección:", error);
    res.status(500).json({ message: "Error al obtener productos de la sección" });
  }
};
