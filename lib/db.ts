// lib/db.js
import mysql from 'mysql2/promise';

// Use globalThis to cache the connection pool across hot reloads in development
// This is a Next.js-specific best practice
const globalForMysql: any = globalThis;

// Check if a pool already exists
let pool = globalForMysql.mysqlPool;

// If not, create a new pool and cache it
if (!pool) {
    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE_NAME,
        waitForConnections: true,
        connectionLimit: 10, 
        queueLimit: 0,
    });

    globalForMysql.mysqlPool = pool;
}

// Export the pool
export const db = pool;