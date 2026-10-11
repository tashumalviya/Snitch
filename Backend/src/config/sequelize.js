import { Sequelize } from "sequelize";
import { config } from "./config.js";

export const sslOptions = config.DB_SSL
    ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
    : {};

export const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: sslOptions
});
