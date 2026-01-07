import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import usuariosRoutes from "./routes/usuarios.routes.js";
import capacitacionesRoutes from "./routes/capacitaciones.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import seccionesRoutes from "./routes/secciones.routes.js";
import asistenciasRoutes from "./routes/asistencias.routes.js";
import capacitacionProductosRoutes from "./routes/capacitacionProductos.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("src/uploads")); // servir firmas

// Rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/capacitaciones", capacitacionesRoutes);
app.use("/api/capacitaciones", capacitacionProductosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/secciones", seccionesRoutes);
app.use("/api/asistencias", asistenciasRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Servidor corriendo en el puerto", PORT));
