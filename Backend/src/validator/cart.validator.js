import { param, body, validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateAddToCart = [
    param("productId").isUUID().withMessage("Invalid product ID"),
    param("variantId").optional().isUUID().withMessage("Invalid variant ID"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    validateRequest
]

export const validateIncrementCartItemQuantity = [
    param("productId").isUUID().withMessage("Invalid product ID"),
    param("variantId").optional().isUUID().withMessage("Invalid variant ID"),
    validateRequest
]