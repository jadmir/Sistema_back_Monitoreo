import db from '../config/db.js';

/**
 * Listar todos los productos de una capacitación específica
 * GET /api/capacitaciones/:id/productos
 */
export const listarProductosCapacitacion = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [productos] = await db.query(`
      SELECT 
        cp.id,
        cp.capacitacion_id,
        cp.producto_id,
        cp.numero_serie,
        cp.version_software,
        cp.internal_id,
        p.referencia,
        p.nombre as producto_nombre,
        s.nombre as seccion_nombre
      FROM capacitacion_productos cp
      INNER JOIN productos p ON cp.producto_id = p.id
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE cp.capacitacion_id = ?
      ORDER BY s.nombre, p.referencia
    `, [id]);
    
    res.json(productos);
  } catch (error) {
    console.error('Error al listar productos de capacitación:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

/**
 * Agregar un producto a una capacitación
 * POST /api/capacitaciones/:id/productos
 * Body: { producto_id, numero_serie?, version_software?, internal_id? }
 */
export const agregarProductoCapacitacion = async (req, res) => {
  const { id } = req.params;
  const { producto_id, numero_serie, version_software, internal_id } = req.body;
  
  try {
    // Validar que la capacitación existe
    const [capacitacion] = await db.query(
      'SELECT id FROM capacitaciones WHERE id = ?',
      [id]
    );
    
    if (capacitacion.length === 0) {
      return res.status(404).json({ error: 'Capacitación no encontrada' });
    }
    
    // Validar que el producto existe
    const [producto] = await db.query(
      'SELECT id FROM productos WHERE id = ?',
      [producto_id]
    );
    
    if (producto.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Verificar si el producto ya está asignado a esta capacitación
    const [existente] = await db.query(
      'SELECT id FROM capacitacion_productos WHERE capacitacion_id = ? AND producto_id = ?',
      [id, producto_id]
    );
    
    if (existente.length > 0) {
      return res.status(400).json({ error: 'El producto ya está asignado a esta capacitación' });
    }
    
    // Insertar el producto en la capacitación
    const [result] = await db.query(
      `INSERT INTO capacitacion_productos 
       (capacitacion_id, producto_id, numero_serie, version_software, internal_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, producto_id, numero_serie || null, version_software || null, internal_id || null]
    );
    
    // Obtener el producto completo recién insertado
    const [nuevoProducto] = await db.query(`
      SELECT 
        cp.id,
        cp.capacitacion_id,
        cp.producto_id,
        cp.numero_serie,
        cp.version_software,
        cp.internal_id,
        p.referencia,
        p.nombre as producto_nombre,
        s.nombre as seccion_nombre
      FROM capacitacion_productos cp
      INNER JOIN productos p ON cp.producto_id = p.id
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE cp.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      mensaje: 'Producto agregado a la capacitación exitosamente',
      producto: nuevoProducto[0]
    });
  } catch (error) {
    console.error('Error al agregar producto a capacitación:', error);
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
};

/**
 * Actualizar datos de un producto en una capacitación
 * PUT /api/capacitaciones/:capacitacion_id/productos/:producto_id
 * Body: { numero_serie?, version_software?, internal_id? }
 */
export const actualizarProductoCapacitacion = async (req, res) => {
  const { capacitacion_id, producto_id } = req.params;
  const { numero_serie, version_software, internal_id } = req.body;
  
  try {
    // Verificar que existe la relación
    const [relacion] = await db.query(
      'SELECT id FROM capacitacion_productos WHERE id = ?',
      [producto_id]
    );
    
    if (relacion.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en esta capacitación' });
    }
    
    // Actualizar los datos
    await db.query(
      `UPDATE capacitacion_productos 
       SET numero_serie = ?, 
           version_software = ?, 
           internal_id = ?
       WHERE id = ?`,
      [numero_serie || null, version_software || null, internal_id || null, producto_id]
    );
    
    // Obtener el producto actualizado
    const [productoActualizado] = await db.query(`
      SELECT 
        cp.id,
        cp.capacitacion_id,
        cp.producto_id,
        cp.numero_serie,
        cp.version_software,
        cp.internal_id,
        p.referencia,
        p.nombre as producto_nombre,
        s.nombre as seccion_nombre
      FROM capacitacion_productos cp
      INNER JOIN productos p ON cp.producto_id = p.id
      INNER JOIN secciones s ON p.seccion_id = s.id
      WHERE cp.id = ?
    `, [producto_id]);
    
    res.json({
      mensaje: 'Producto actualizado exitosamente',
      producto: productoActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar producto de capacitación:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

/**
 * Eliminar un producto de una capacitación
 * DELETE /api/capacitaciones/:capacitacion_id/productos/:producto_id
 */
export const eliminarProductoCapacitacion = async (req, res) => {
  const { capacitacion_id, producto_id } = req.params;
  
  try {
    // Verificar que existe la relación
    const [relacion] = await db.query(
      'SELECT id FROM capacitacion_productos WHERE id = ?',
      [producto_id]
    );
    
    if (relacion.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en esta capacitación' });
    }
    
    // Eliminar la relación
    await db.query('DELETE FROM capacitacion_productos WHERE id = ?', [producto_id]);
    
    res.json({ mensaje: 'Producto eliminado de la capacitación exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto de capacitación:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

/**
 * Agregar múltiples productos a una capacitación
 * POST /api/capacitaciones/:id/productos/batch
 * Body: { productos: [{ producto_id, numero_serie?, version_software?, internal_id? }] }
 */
export const agregarProductosMultiples = async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;
  
  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Se debe proporcionar un array de productos' });
  }
  
  try {
    // Validar que la capacitación existe
    const [capacitacion] = await db.query(
      'SELECT id FROM capacitaciones WHERE id = ?',
      [id]
    );
    
    if (capacitacion.length === 0) {
      return res.status(404).json({ error: 'Capacitación no encontrada' });
    }
    
    const resultados = {
      agregados: [],
      errores: []
    };
    
    // Procesar cada producto
    for (const prod of productos) {
      try {
        const { producto_id, numero_serie, version_software, internal_id } = prod;
        
        // Validar que el producto existe
        const [productoExiste] = await db.query(
          'SELECT id FROM productos WHERE id = ?',
          [producto_id]
        );
        
        if (productoExiste.length === 0) {
          resultados.errores.push({
            producto_id,
            error: 'Producto no encontrado'
          });
          continue;
        }
        
        // Verificar si ya está asignado
        const [existente] = await db.query(
          'SELECT id FROM capacitacion_productos WHERE capacitacion_id = ? AND producto_id = ?',
          [id, producto_id]
        );
        
        if (existente.length > 0) {
          resultados.errores.push({
            producto_id,
            error: 'El producto ya está asignado a esta capacitación'
          });
          continue;
        }
        
        // Insertar el producto
        const [result] = await db.query(
          `INSERT INTO capacitacion_productos 
           (capacitacion_id, producto_id, numero_serie, version_software, internal_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [id, producto_id, numero_serie || null, version_software || null, internal_id || null]
        );
        
        // Obtener el producto completo
        const [nuevoProducto] = await db.query(`
          SELECT 
            cp.id,
            cp.capacitacion_id,
            cp.producto_id,
            cp.numero_serie,
            cp.version_software,
            cp.internal_id,
            p.referencia,
            p.nombre as producto_nombre,
            s.nombre as seccion_nombre
          FROM capacitacion_productos cp
          INNER JOIN productos p ON cp.producto_id = p.id
          INNER JOIN secciones s ON p.seccion_id = s.id
          WHERE cp.id = ?
        `, [result.insertId]);
        
        resultados.agregados.push(nuevoProducto[0]);
      } catch (error) {
        resultados.errores.push({
          producto_id: prod.producto_id,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      mensaje: `Se agregaron ${resultados.agregados.length} productos exitosamente`,
      resultados
    });
  } catch (error) {
    console.error('Error al agregar productos múltiples:', error);
    res.status(500).json({ error: 'Error al agregar los productos' });
  }
};
