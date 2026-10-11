import mysql from "mysql2/promise";
import { config } from "./config.js";
import { sequelize, sslOptions } from "./sequelize.js";
import "../models/index.js"; // saare models + relations register ho jaye

const ensureDatabaseExists = async () => {
    try {
        const connection = await mysql.createConnection({
            host: config.DB_HOST,
            port: config.DB_PORT,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            ...sslOptions
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\``);
        await connection.end();
    } catch (error) {
        // Online DB mein permission na ho toh skip; database pehle se bana hona chahiye
        console.warn("Could not auto-create database (continuing):", error.message);
    }
};

const connectDB = async () => {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync(); // tables nahi hain toh bana deta hai
    console.log("MySQL connected");
};

export default connectDB;
