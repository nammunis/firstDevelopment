import express from "express";
import {
    addReview,
    getAllReviews,
    getMyReviews,
    getProductReviews,
    getOrderReviews,
    updateOrderStatus,
    moderateReview
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// GET /api/reviews - Get all reviews (public)
reviewRouter.get("/", getAllReviews);

// GET /api/reviews/my - Get current user's reviews
reviewRouter.get("/my", getMyReviews);

// POST /api/reviews - Add a review
reviewRouter.post("/", addReview);

// POST /api/reviews/create - Add a review (legacy compatibility)
reviewRouter.post("/create", addReview);

// GET /api/reviews/product/:productId - Get all reviews for a product
reviewRouter.get("/product/:productId", getProductReviews);

// GET /api/reviews/order/:orderId - Get all reviews for an order
reviewRouter.get("/order/:orderId", getOrderReviews);

// PATCH|PUT /api/reviews/:reviewId - Moderate a review (admin only)
reviewRouter.patch("/:reviewId", moderateReview);
reviewRouter.put("/:reviewId", moderateReview);

// PATCH /api/reviews/moderate/:reviewId - Moderate a review (admin only)
reviewRouter.patch("/moderate/:reviewId", moderateReview);

// POST /api/reviews/moderate - Moderate a review using body.reviewId (admin only)
reviewRouter.post("/moderate", moderateReview);

// PUT /api/reviews/order/:orderId/status - Update order status (admin only)
reviewRouter.put("/order/:orderId/status", updateOrderStatus);

export default reviewRouter;
