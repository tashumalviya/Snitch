import { productModel, variantModel } from "../models/index.js";
import { uploadFile } from "../services/storage.service.js";
import { serializeProduct } from "../utils/serialize.js";


const withVariants = {
    include: [ { model: variantModel, as: "variants" } ],
    order: [
        [ "createdAt", "ASC" ],
        [ { model: variantModel, as: "variants" }, "createdAt", "ASC" ]
    ]
}

// ImageKit poora object deta hai, pehle bhi sirf { url } save hota tha
const toImages = (uploaded) => uploaded.map(image => ({ url: image.url }))


export async function createProduct(req, res) {

    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

    const uploaded = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))


    const product = await productModel.create({
        title,
        description,
        priceAmount: Number(priceAmount),
        priceCurrency: priceCurrency || "INR",
        images: toImages(uploaded),
        sellerId: seller.id
    })


    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product: serializeProduct(product)
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user;

    const products = await productModel.findAll({
        where: { sellerId: seller.id },
        ...withVariants
    });


    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products: products.map(product => serializeProduct(product))
    })
}

export async function getAllProducts(req, res) {
    const products = await productModel.findAll(withVariants)

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products: products.map(product => serializeProduct(product))
    })
}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findByPk(id, withVariants)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product: serializeProduct(product)
    })
}


export async function addProductVariant(req, res) {

    const productId = req.params.productId;

    const product = await productModel.findOne({
        where: {
            id: productId,
            sellerId: req.user.id
        }
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files || [];
    const uploaded = await Promise.all(files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))
    const images = toImages(uploaded)

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")

    await variantModel.create({
        productId: product.id,
        images,
        priceAmount: Number(price) || product.priceAmount,
        priceCurrency: req.body.priceCurrency || product.priceCurrency,
        stock: Number(stock) || 0,
        attrs: attributes
    })

    const updatedProduct = await productModel.findByPk(product.id, withVariants)

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product: serializeProduct(updatedProduct)
    })

}
