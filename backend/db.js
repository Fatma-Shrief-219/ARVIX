const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

async function connectToDB() {
    try {
        await sql.connect(config);
        console.log(" Connected to SQL Server Successfully!");
    } catch (err) {
        console.error(" Database connection failed:", err);
    }
}

module.exports = { sql, connectToDB };