import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import { CURRENCIES } from "./product.model.js";

const cartModel = sequelize.define("cart", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true }
}, { tableName: "carts" });

export const cartItemModel = sequelize.define("cartItem", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cartId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    variantId: { type: DataTypes.UUID, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    priceAmount: { type: DataTypes.DOUBLE, allowNull: false },
    priceCurrency: { type: DataTypes.ENUM(...CURRENCIES), allowNull: false, defaultValue: "INR" },
    createdAt: { type: DataTypes.DATE(3), allowNull: false },
    updatedAt: { type: DataTypes.DATE(3), allowNull: false }
}, {
    tableName: "cart_items",
    indexes: [ { unique: true, fields: [ "cartId", "productId", "variantId" ] } ]
});

export default cartModel;
