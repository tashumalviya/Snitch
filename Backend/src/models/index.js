import userModel from "./user.model.js";
import productModel from "./product.model.js";
import variantModel from "./variant.model.js";
import cartModel, { cartItemModel } from "./cart.model.js";
import paymentModel, { paymentItemModel } from "./payment.model.js";

// User <-> Product (seller)
userModel.hasMany(productModel, { foreignKey: "sellerId", as: "products" });
productModel.belongsTo(userModel, { foreignKey: { name: "sellerId", allowNull: false }, as: "seller" });

// Product <-> Variant
productModel.hasMany(variantModel, { foreignKey: { name: "productId", allowNull: false }, as: "variants", onDelete: "CASCADE" });
variantModel.belongsTo(productModel, { foreignKey: { name: "productId", allowNull: false }, as: "product", onDelete: "CASCADE" });

// User <-> Cart <-> CartItem
userModel.hasOne(cartModel, { foreignKey: "userId", onDelete: "CASCADE" });
cartModel.belongsTo(userModel, { foreignKey: "userId" });
cartModel.hasMany(cartItemModel, { foreignKey: "cartId", as: "items", onDelete: "CASCADE" });
cartItemModel.belongsTo(cartModel, { foreignKey: "cartId" });
cartItemModel.belongsTo(productModel, { foreignKey: "productId", as: "product", onDelete: "CASCADE" });
cartItemModel.belongsTo(variantModel, { foreignKey: "variantId", as: "variant", onDelete: "CASCADE" });

// User <-> Payment <-> PaymentItem
userModel.hasMany(paymentModel, { foreignKey: "userId" });
paymentModel.belongsTo(userModel, { foreignKey: "userId" });
paymentModel.hasMany(paymentItemModel, { foreignKey: "paymentId", as: "orderItems", onDelete: "CASCADE" });
paymentItemModel.belongsTo(paymentModel, { foreignKey: "paymentId" });

export { userModel, productModel, variantModel, cartModel, cartItemModel, paymentModel, paymentItemModel };
