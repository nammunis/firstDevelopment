import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    reviewId: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ""
    },
    approval: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    adminReply: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    }
});

reviewSchema.index({ userId: 1, orderId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
