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

reviewRouter.get("/", getAllReviews);

reviewRouter.get("/my", getMyReviews);

reviewRouter.post("/", addReview);

reviewRouter.post("/create", addReview);

reviewRouter.get("/product/:productId", getProductReviews);

reviewRouter.get("/order/:orderId", getOrderReviews);

reviewRouter.patch("/:reviewId", moderateReview);

reviewRouter.put("/:reviewId", moderateReview);

reviewRouter.patch("/moderate/:reviewId", moderateReview);

reviewRouter.post("/moderate", moderateReview);

reviewRouter.put("/order/:orderId/status", updateOrderStatus);

export default reviewRouter;
