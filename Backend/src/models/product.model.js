import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const CURRENCIES = [ "USD", "EUR", "GBP", "JPY", "INR" ];

const productModel = sequelize.define("product", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priceAmount: { type: DataTypes.DOUBLE, allowNull: false },
    priceCurrency: { type: DataTypes.ENUM(...CURRENCIES), allowNull: false, defaultValue: "INR" },
    images: { type: DataTypes.JSON, allowNull: true }, // [{ url }]
    createdAt: { type: DataTypes.DATE(3), allowNull: false },
    updatedAt: { type: DataTypes.DATE(3), allowNull: false }
}, { tableName: "products" });

export default productModel;
