import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    items: [
        {
            productId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: String,
                required: true
            },
            qty: {
                type: Number,
                required: true
            },
            total: {
                type: Number,
                required: true,
                default: 0
            }
        }
    ],
    notes: {
        type: String,
        default: 'No additional notes!'
    },
    review: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    approval: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
})

const Order = mongoose.model('Order', orderSchema)

export default Order;