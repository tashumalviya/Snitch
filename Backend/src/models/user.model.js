import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/sequelize.js";

const userModel = sequelize.define("user", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    contact: { type: DataTypes.STRING(20), allowNull: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    fullname: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM("buyer", "seller"), allowNull: false, defaultValue: "buyer" },
    googleId: { type: DataTypes.STRING(255), allowNull: true }
}, {
    tableName: "users",
    validate: {
        passwordRequiredWithoutGoogle() {
            if (!this.googleId && !this.password) {
                throw new Error("password is required");
            }
        }
    },
    hooks: {
        beforeSave: async (user) => {
            if (user.password && user.changed("password")) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

userModel.prototype.comparePassword = async function (password) {
    if (!this.password) return false; // Google user ke paas password nahi hota
    return await bcrypt.compare(password, this.password);
};

export default userModel;
