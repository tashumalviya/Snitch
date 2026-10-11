// Frontend ko Mongo jaisa response chahiye (_id, price: { amount, currency }, variants[]).
// Ye helpers MySQL rows ko wahi shape mein convert karte hain.

const parseJson = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") {
        try { return JSON.parse(value); } catch { return fallback; }
    }
    return value;
};

export const toPrice = (amount, currency) => ({
    amount: Number(amount),
    currency
});

export const serializeVariant = (variant) => ({
    _id: variant.id,
    images: parseJson(variant.images, []),
    stock: variant.stock,
    attributes: parseJson(variant.attrs, {}),
    price: toPrice(variant.priceAmount, variant.priceCurrency)
});

// variants: "array" (normal product) ya "none" (cart ke andar alag se set hota hai)
export const serializeProduct = (product, { includeVariants = true } = {}) => {
    const data = {
        _id: product.id,
        title: product.title,
        description: product.description,
        seller: product.sellerId,
        price: toPrice(product.priceAmount, product.priceCurrency),
        images: parseJson(product.images, []),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };

    if (includeVariants) {
        data.variants = (product.variants || []).map(serializeVariant);
    }

    return data;
};
