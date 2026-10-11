import { cartModel, cartItemModel, productModel, variantModel } from "../models/index.js";
import { serializeProduct, serializeVariant, toPrice } from "../utils/serialize.js";

// Mongo aggregate wala same result:
// { _id, totalPrice, currency, items: [ { product: {..., variants: <matched variant>}, variant, quantity, price } ] }
// Cart khali ho toh undefined return hota hai (pehle jaisa).
export async function getCartDetails(userId) {
    const cart = await cartModel.findOne({ where: { userId } })

    if (!cart) return undefined

    const rows = await cartItemModel.findAll({
        where: { cartId: cart.id },
        include: [
            { model: productModel, as: "product" },
            { model: variantModel, as: "variant" }
        ],
        order: [ [ "createdAt", "ASC" ] ]
    })

    const items = rows
        .filter(row => row.product && row.variant)
        .map(row => ({
            _id: row.id,
            product: {
                ...serializeProduct(row.product, { includeVariants: false }),
                variants: serializeVariant(row.variant)
            },
            variant: row.variantId,
            quantity: row.quantity,
            price: toPrice(row.priceAmount, row.priceCurrency)
        }))

    if (items.length === 0) return undefined

    const totalPrice = items.reduce(
        (sum, item) => sum + item.quantity * item.product.variants.price.amount,
        0
    )

    return {
        _id: cart.id,
        totalPrice,
        currency: items[ 0 ].product.variants.price.currency,
        items
    }
}
