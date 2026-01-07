import pool from '../config/db.js';

// Listar todos los productos
export const listarProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.id,
        p.referencia,
        p.nombre,
        s.id as seccion_id,
        s.nombre as seccion_nombre
      FROM productos p
      INNER JOIN secciones s ON p.seccion_id = s.id
      ORDER BY s.nombre, p.nombre
    `);

    res.json(productos);
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Listar productos por sección
export const listarProductosPorSeccion = async (req, res) => {
  try {
    const { seccionId } = req.params;
    
    const [productos] = await pool.query(`
      SELECT 
        p.id,
        p.referencia,
        p.nombre,
        s.id as seccion_id,
        s.nombre as seccion_nombre
      FROM productos p
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE p.seccion_id = ?
      ORDER BY p.nombre
    `, [seccionId]);

    res.json(productos);
  } catch (error) {
    console.error('Error al listar productos por sección:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Buscar productos por referencia o nombre
export const buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Parámetro de búsqueda requerido' });
    }

    const [productos] = await pool.query(`
      SELECT 
        p.id,
        p.referencia,
        p.nombre,
        s.id as seccion_id,
        s.nombre as seccion_nombre
      FROM productos p
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE p.referencia LIKE ? OR p.nombre LIKE ?
      ORDER BY p.referencia
    `, [`%${q}%`, `%${q}%`]);

    res.json(productos);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ message: 'Error al buscar productos' });
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(`
      SELECT 
        p.id,
        p.referencia,
        p.nombre,
        s.id as seccion_id,
        s.nombre as seccion_nombre
      FROM productos p
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE p.id = ?
    `, [id]);

    if (productos.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(productos[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

// Listar todas las secciones
export const listarSecciones = async (req, res) => {
  try {
    const [secciones] = await pool.query('SELECT * FROM secciones ORDER BY nombre');
    res.json(secciones);
  } catch (error) {
    console.error('Error al listar secciones:', error);
    res.status(500).json({ message: 'Error al obtener secciones' });
  }
};

// CREAR PRODUCTO ---------------------------------------
export const crearProducto = async (req, res) => {
  try {
    const { seccion_id, referencia, nombre } = req.body;

    // Validar campos requeridos
    if (!seccion_id || !referencia || !nombre) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos (seccion_id, referencia, nombre)' 
      });
    }

    // Verificar que la sección existe
    const [seccionExiste] = await pool.query(
      'SELECT id FROM secciones WHERE id = ?',
      [seccion_id]
    );

    if (seccionExiste.length === 0) {
      return res.status(404).json({ message: 'La sección especificada no existe' });
    }

    // Verificar si ya existe un producto con la misma referencia
    const [referenciaExiste] = await pool.query(
      'SELECT id FROM productos WHERE referencia = ?',
      [referencia.trim()]
    );

    if (referenciaExiste.length > 0) {
      return res.status(400).json({ 
        message: 'Ya existe un producto con esa referencia' 
      });
    }

    // Insertar producto
    const [result] = await pool.query(
      'INSERT INTO productos (seccion_id, referencia, nombre) VALUES (?, ?, ?)',
      [seccion_id, referencia.trim(), nombre.trim()]
    );

    // Obtener el producto creado con información de la sección
    const [nuevoProducto] = await pool.query(`
      SELECT 
        p.id,
        p.referencia,
        p.nombre,
        s.id as seccion_id,
        s.nombre as seccion_nombre
      FROM productos p
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto: nuevoProducto[0]
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// ACTUALIZAR PRODUCTO ---------------------------------------
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { seccion_id, referencia, nombre } = req.body;

    // Validar campos requeridos
    if (!seccion_id || !referencia || !nombre) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos (seccion_id, referencia, nombre)' 
      });
    }

    // Verificar que el producto existe
    const [productoExiste] = await pool.query(
      'SELECT id FROM productos WHERE id = ?',
      [id]
    );

    if (productoExiste.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar que la sección existe
    const [seccionExiste] = await pool.query(
      'SELECT id FROM secciones WHERE id = ?',
      [seccion_id]
    );

    if (seccionExiste.length === 0) {
      return res.status(404).json({ message: 'La sección especificada no existe' });
    }

    // Verificar si ya existe otro producto con la misma referencia
    const [referenciaExiste] = await pool.query(
      'SELECT id FROM productos WHERE referencia = ? AND id != ?',
      [referencia.trim(), id]
    );

    if (referenciaExiste.length > 0) {
      return res.status(400).json({ 
        message: 'Ya existe otro producto con esa referencia' 
      });
    }

    // Actualizar producto
    await pool.query(
      'UPDATE productos SET seccion_id = ?, referencia = ?, nombre = ? WHERE id = ?',
      [seccion_id, referencia.trim(), nombre.trim(), id]
    );

    // Obtener el producto actualizado con información de la sección
    const [productoActualizado] = await pool.query(`
      SELECT 
        p.id,
        p.referencia,
        p.nombre,
        s.id as seccion_id,
        s.nombre as seccion_nombre
      FROM productos p
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      message: 'Producto actualizado exitosamente',
      producto: productoActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// ELIMINAR PRODUCTO ---------------------------------------
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el producto existe
    const [productoExiste] = await pool.query(
      'SELECT id, referencia, nombre FROM productos WHERE id = ?',
      [id]
    );

    if (productoExiste.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si hay capacitaciones asociadas a este producto
    const [capacitacionesAsociadas] = await pool.query(
      'SELECT COUNT(*) as total FROM capacitacion_productos WHERE producto_id = ?',
      [id]
    );

    if (capacitacionesAsociadas[0].total > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el producto "${productoExiste[0].nombre}" porque está asociado a ${capacitacionesAsociadas[0].total} capacitación(es)`,
        capacitacionesAsociadas: capacitacionesAsociadas[0].total
      });
    }

    // Eliminar producto
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);

    res.json({
      message: 'Producto eliminado exitosamente',
      producto: productoExiste[0]
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};
