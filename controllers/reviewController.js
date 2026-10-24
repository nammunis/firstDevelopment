import { Review } from "../models/review.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function getAllReviews(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const reviews = await Review.find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments();
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            reviews,
            total,
            page,
            limit,
            totalPages
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch reviews" });
    }
}

export async function getMyReviews(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "cbc123");
        const userId = decoded.id;

        const reviews = await Review.find({ userId }).sort({ date: -1 });

        return res.status(200).json({
            reviews,
            count: reviews.length
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch user reviews" });
    }
}

export async function addReview(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "cbc123");
        const userId = decoded.id;

        const { orderId, productId, rating, comment } = req.body;

        if (!orderId || !productId || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const existingReview = await Review.findOne({ userId, orderId, productId });
        if (existingReview) {
            return res.status(409).json({ error: "You have already submitted a review for this item." });
        }

        const reviewId = `REV${Date.now()}`;

        const review = new Review({
            reviewId,
            orderId,
            userId,
            userName: decoded.firstName + " " + decoded.lastName,
            productId,
            rating,
            comment: comment || ""
        });

        await review.save();
        return res.status(201).json({ message: "Review added successfully", review });
    } catch (err) {
        console.error(err);

        if (err?.code === 11000) {
            return res.status(409).json({ error: "You have already submitted a review for this item." });
        }

        return res.status(500).json({ error: "Failed to add review" });
    }
}

export async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ productId }).sort({ date: -1 });
        return res.status(200).json({ reviews, count: reviews.length });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch reviews" });
    }
}

export async function getOrderReviews(req, res) {
    try {
        const { orderId } = req.params;

        const reviews = await Review.find({ orderId }).sort({ date: -1 });
        return res.status(200).json({ reviews, count: reviews.length });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch order reviews" });
    }
}

export async function updateOrderStatus(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "cbc123");
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Only admins can update order status" });
        }

        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const validStatuses = ["pending", "approved", "rejected", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        return res.status(200).json({ message: "Status update placeholder" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update order status" });
    }
}

export async function moderateReview(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "cbc123");
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Only admins can moderate reviews" });
        }

        const reviewId = req.params.reviewId || req.body.reviewId;
        if (!reviewId) {
            return res.status(400).json({ error: "reviewId is required" });
        }

        const lookupConditions = [{ reviewId: String(reviewId) }];
        if (mongoose.Types.ObjectId.isValid(reviewId)) {
            lookupConditions.push({ _id: reviewId });
        }

        const review = await Review.findOne({ $or: lookupConditions });
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        const { approval, rating, comment, adminReply, adminResponse } = req.body;

        if (approval !== undefined) {
            const validApprovals = ["pending", "approved", "rejected"];
            if (!validApprovals.includes(approval)) {
                return res.status(400).json({ error: "Invalid approval status" });
            }
            review.approval = approval;
        }

        if (rating !== undefined) {
            const normalizedRating = Number(rating);
            if (Number.isNaN(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
                return res.status(400).json({ error: "Rating must be between 1 and 5" });
            }
            review.rating = normalizedRating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        if (adminReply !== undefined) {
            review.adminReply = adminReply;
        } else if (adminResponse !== undefined) {
            review.adminReply = adminResponse;
        }

        await review.save();

        return res.status(200).json({
            message: "Review moderation updated successfully",
            review
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to moderate review" });
    }
}
