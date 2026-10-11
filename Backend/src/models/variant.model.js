import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import { CURRENCIES } from "./product.model.js";

const variantModel = sequelize.define("variant", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    images: { type: DataTypes.JSON, allowNull: true }, // [{ url }]
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attrs: { type: DataTypes.JSON, allowNull: true }, // { size: "M", color: "Black" }
    priceAmount: { type: DataTypes.DOUBLE, allowNull: true },
    priceCurrency: { type: DataTypes.ENUM(...CURRENCIES), allowNull: true },
    createdAt: { type: DataTypes.DATE(3), allowNull: false },
    updatedAt: { type: DataTypes.DATE(3), allowNull: false }
}, { tableName: "variants" });

export default variantModel;
