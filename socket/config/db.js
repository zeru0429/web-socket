import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const service = process.env.DB_CONNECTION;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const password = process.env.DB_PASSWORD;
const user = process.env.DB_USERNAME;
const database = process.env.DB_DATABASE;

const pool = mysql.createPool({
  host,
  port,
  password,
  user,
  database,
  connectionLimit: 10,
});

async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

export default query;
