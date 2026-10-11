import {
    cartModel,
    cartItemModel,
    variantModel,
    productModel,
    paymentModel,
    paymentItemModel
} from "../models/index.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { createOrder } from "../services/payment.service.js";
import { getCartDetails } from "../dao/cart.dao.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../config/config.js";


// Product + variant dono exist karte hain ya nahi (Mongo wale "variants._id" check jaisa)
const findProductVariant = (productId, variantId) => variantModel.findOne({
    where: { id: variantId, productId },
    include: [ { model: productModel, as: "product" } ]
})


export const addToCart = async (req, res) => {

    const { productId, variantId } = req.params
    const quantity = Number(req.body.quantity ?? 1)

    const variant = await findProductVariant(productId, variantId)

    if (!variant) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }

    const stock = await stockOfVariant(productId, variantId)

    const [ cart ] = await cartModel.findOrCreate({ where: { userId: req.user.id } })

    const existingItem = await cartItemModel.findOne({
        where: { cartId: cart.id, productId, variantId }
    })

    if (existingItem) {
        const quantityInCart = existingItem.quantity
        if (quantityInCart + quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
                success: false
            })
        }

        await existingItem.increment("quantity", { by: quantity })

        return res.status(200).json({
            message: "Cart updated successfully",
            success: true
        })
    }

    if (quantity > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock`,
            success: false
        })
    }

    await cartItemModel.create({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        priceAmount: variant.product.priceAmount,
        priceCurrency: variant.product.priceCurrency
    })

    return res.status(200).json({
        message: "Product added to cart successfully",
        success: true
    })
}

export const getCart = async (req, res) => {
    const user = req.user

    let cart = await getCartDetails(user.id)

    if (!cart) {
        const [ emptyCart ] = await cartModel.findOrCreate({ where: { userId: user.id } })
        cart = { _id: emptyCart.id, user: user.id, items: [] }
    }

    return res.status(200).json({
        message: "Cart fetched successfully",
        success: true,
        cart
    })
}

export const incrementCartItemQuantity = async (req, res) => {
    const { productId, variantId } = req.params

    const variant = await findProductVariant(productId, variantId)

    if (!variant) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }

    const cart = await cartModel.findOne({ where: { userId: req.user.id } })

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        })
    }

    const stock = await stockOfVariant(productId, variantId)

    const cartItem = await cartItemModel.findOne({
        where: { cartId: cart.id, productId, variantId }
    })

    const itemQuantityInCart = cartItem?.quantity || 0

    if (itemQuantityInCart + 1 > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart`,
            success: false
        })
    }

    if (cartItem) {
        await cartItem.increment("quantity", { by: 1 })
    }

    return res.status(200).json({
        message: "Cart item quantity incremented successfully",
        success: true
    })
}

export const createOrderController = async (req, res) => {


    const cart = await getCartDetails(req.user.id)

    if (!cart) {
        return res.status(400).json({
            message: "Cart is empty",
            success: false
        })
    }

    const order = await createOrder({ amount: cart.totalPrice, currency: cart.currency })

    await paymentModel.create({
        userId: req.user.id,
        razorpayOrderId: order.id,
        priceAmount: cart.totalPrice,
        priceCurrency: cart.currency,
        orderItems: cart.items.map(item => ({
            title: item.product.title,
            productId: item.product._id,
            variantId: item.variant,
            quantity: item.quantity,
            images: item.product.variants.images || item.product.images,
            description: item.product.description,
            priceAmount: item.product.variants.price.amount || item.product.price.amount,
            priceCurrency: item.product.variants.price.currency || item.product.price.currency
        }))
    }, {
        include: [ { model: paymentItemModel, as: "orderItems" } ]
    })

    return res.status(200).json({
        message: "Order created successfully",
        success: true,
        order
    })
}

export const verifyOrderController = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body

    const payment = await paymentModel.findOne({
        where: {
            razorpayOrderId: razorpay_order_id,
            status: "pending"
        }
    })

    if (!payment) {
        return res.status(400).json({
            message: "Payment not found",
            success: false
        })
    }

    const isPaymentValid = validatePaymentVerification({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
    }, razorpay_signature, config.RAZORPAY_KEY_SECRET)

    if (!isPaymentValid) {
        payment.status = "failed"
        await payment.save()

        return res.status(400).json({
            message: "Payment verification failed",
            success: false
        })
    }

    payment.status = "paid"
    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature

    await payment.save()

    return res.status(200).json({
        message: "Payment verified successfully",
        success: true
    })
}
