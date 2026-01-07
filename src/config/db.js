import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Usar DATABASE_URL de Railway si existe, sino usar variables individuales
const connectionConfig = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    };

const db = mysql.createPool({
  ...(typeof connectionConfig === 'string' ? { uri: connectionConfig } : connectionConfig),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;