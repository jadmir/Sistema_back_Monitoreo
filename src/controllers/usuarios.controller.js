import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

// LOGIN ------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        firma: user.firma,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

// CREAR USUARIO (ADMIN) ---------------------------------------
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Validar que el email no esté ya registrado
    const [existente] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existente.length > 0) {
      return res.status(409).json({ message: "El correo electrónico ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const firma = req.file ? `uploads/firmas/${req.file.filename}` : null;

    await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol, firma) VALUES (?, ?, ?, ?, ?)",
      [nombre, email, hashed, rol, firma]
    );

    res.json({ message: "Usuario creado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al crear usuario", error: err.message });
  }
};

// LISTAR USUARIOS (ADMIN) -------------------------------------
export const listarUsuarios = async (req, res) => {
  const [rows] = await db.query("SELECT id, nombre, email, rol, firma FROM usuarios");
  res.json(rows);
};

// BUSCAR USUARIOS (ADMIN) --------------------------------------
export const buscarUsuarios = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Debe proporcionar un término de búsqueda" });
    }

    const searchTerm = `%${q}%`;
    const [rows] = await db.query(
      "SELECT id, nombre, email, rol, firma FROM usuarios WHERE nombre LIKE ? OR email LIKE ?",
      [searchTerm, searchTerm]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al buscar usuarios", error: err.message });
  }
};

// ACTUALIZAR USUARIO (ADMIN) -----------------------------------
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, password } = req.body;

    // Validar que el usuario existe
    const [usuario] = await db.query("SELECT id FROM usuarios WHERE id = ?", [id]);
    if (usuario.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar que el email no esté ya registrado por otro usuario
    if (email) {
      const [existente] = await db.query(
        "SELECT id FROM usuarios WHERE email = ? AND id != ?",
        [email, id]
      );
      if (existente.length > 0) {
        return res.status(409).json({ message: "El correo electrónico ya está registrado" });
      }
    }

    // Construir la consulta de actualización dinámicamente
    let query = "UPDATE usuarios SET";
    const params = [];

    if (nombre) {
      query += " nombre = ?,";
      params.push(nombre);
    }

    if (email) {
      query += " email = ?,";
      params.push(email);
    }

    if (rol) {
      query += " rol = ?,";
      params.push(rol);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += " password = ?,";
      params.push(hashed);
    }

    if (req.file) {
      const firma = `uploads/firmas/${req.file.filename}`;
      query += " firma = ?,";
      params.push(firma);
    }

    // Remover la última coma y agregar la condición WHERE
    query = query.slice(0, -1) + " WHERE id = ?";
    params.push(id);

    await db.query(query, params);

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar usuario", error: err.message });
  }
};

// ACTUALIZAR FIRMA (SOLO EL USUARIO) ---------------------------
export const actualizarFirma = async (req, res) => {
  try {
    const firma = req.file ? `uploads/firmas/${req.file.filename}` : null;
    if (!firma) return res.status(400).json({ message: "No se subió una firma" });

    await db.query("UPDATE usuarios SET firma = ? WHERE id = ?", [firma, req.user.id]);

    res.json({ message: "Firma actualizada", firma });
  } catch {
    res.status(500).json({ message: "Error al actualizar firma" });
  }
};

// ACTUALIZAR PERFIL PROPIO (USUARIO LOGUEADO) ------------------
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const userId = req.user.id;

    // Validar que el email no esté ya registrado por otro usuario
    if (email) {
      const [existente] = await db.query(
        "SELECT id FROM usuarios WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (existente.length > 0) {
        return res.status(409).json({ message: "El correo electrónico ya está registrado" });
      }
    }

    // Construir la consulta de actualización dinámicamente
    let query = "UPDATE usuarios SET";
    const params = [];

    if (nombre) {
      query += " nombre = ?,";
      params.push(nombre);
    }

    if (email) {
      query += " email = ?,";
      params.push(email);
    }

    if (req.file) {
      const firma = `uploads/firmas/${req.file.filename}`;
      query += " firma = ?,";
      params.push(firma);
    }

    // Si no hay campos para actualizar
    if (params.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    // Remover la última coma y agregar la condición WHERE
    query = query.slice(0, -1) + " WHERE id = ?";
    params.push(userId);

    await db.query(query, params);

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar perfil", error: err.message });
  }
};

// CAMBIAR CONTRASEÑA (SOLO EL USUARIO) -------------------------
export const cambiarPassword = async (req, res) => {
  try {
    const { actual, nueva } = req.body;

    const [rows] = await db.query("SELECT password FROM usuarios WHERE id = ?", [
      req.user.id,
    ]);
    const user = rows[0];

    const valid = await bcrypt.compare(actual, user.password);
    if (!valid) return res.status(401).json({ message: "Contraseña actual incorrecta" });

    const hashed = await bcrypt.hash(nueva, 10);

    await db.query("UPDATE usuarios SET password = ? WHERE id = ?", [hashed, req.user.id]);

    res.json({ message: "Contraseña actualizada" });
  } catch {
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
};

// OBTENER USUARIO POR ID (ADMIN) --------------------------------
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT id, nombre, email, rol, firma FROM usuarios WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuario", error: err.message });
  }
};

// ELIMINAR USUARIO (ADMIN) --------------------------------------
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario existe
    const [usuario] = await db.query("SELECT id FROM usuarios WHERE id = ?", [id]);
    if (usuario.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // No permitir eliminar el propio usuario
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propio usuario" });
    }

    await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar usuario", error: err.message });
  }
};
