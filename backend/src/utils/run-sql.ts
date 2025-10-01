import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSqlScript() {
  try {
    const client = await pool.connect();
    const sql = fs.readFileSync(path.join(__dirname, '../../database/init.sql'), 'utf8');
    await client.query(sql);
    client.release();
    console.log('Script SQL ejecutado exitosamente.');
  } catch (error) {
    console.error('Error al ejecutar el script SQL:', error);
  } finally {
    await pool.end();
  }
}

runSqlScript();