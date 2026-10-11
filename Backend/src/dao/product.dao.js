import { variantModel } from "../models/index.js";

export const stockOfVariant = async (productId, variantId) => {
    const variant = await variantModel.findOne({
        where: { id: variantId, productId }
    })

    return variant.stock
}
