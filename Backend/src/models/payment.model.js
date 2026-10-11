import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import { CURRENCIES } from "./product.model.js";

const paymentModel = sequelize.define("payment", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM("pending", "paid", "failed"), allowNull: false, defaultValue: "pending" },
    priceAmount: { type: DataTypes.DOUBLE, allowNull: false },
    priceCurrency: { type: DataTypes.ENUM(...CURRENCIES), allowNull: false, defaultValue: "INR" },
    razorpayOrderId: { type: DataTypes.STRING(191), allowNull: true },
    razorpayPaymentId: { type: DataTypes.STRING(191), allowNull: true },
    razorpaySignature: { type: DataTypes.STRING(255), allowNull: true }
}, {
    tableName: "payments",
    indexes: [ { fields: [ "razorpayOrderId" ] } ]
});

// Order ke time ka snapshot; product baad mein delete ho jaye toh bhi record rahe
export const paymentItemModel = sequelize.define("paymentItem", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    paymentId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: true },
    productId: { type: DataTypes.UUID, allowNull: true },
    variantId: { type: DataTypes.UUID, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true },
    images: { type: DataTypes.JSON, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    priceAmount: { type: DataTypes.DOUBLE, allowNull: true },
    priceCurrency: { type: DataTypes.ENUM(...CURRENCIES), allowNull: true }
}, { tableName: "payment_items" });

export default paymentModel;
