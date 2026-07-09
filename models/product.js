import mongoose from "mongoose"

const productSchema = mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            unique: true
        },
        productName: {
            type: String,
            required: true
        },
        altName: {
            type: [String],
            default: []
        },
        labelledPrice: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        images: {
            type: [String],
            default: ['/default-product.jpg']
        },
        description: {
            type: String,
            required: true
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        catagory: {
            type: String,
            required: true,
            default: 'Uncategorised'
        }
    }
)

const Product = mongoose.model("product", productSchema)

export default Product