import db from "./src/config/db.js";

const test = async () => {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Conexión MySQL exitosa:", rows);
  } catch (err) {
    console.error("Error de conexión:", err);
  }
};

test();
