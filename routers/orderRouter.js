import express from "express";
import { creatOrder, getOrders, updateOrder } from "../controllers/orderController.js";

const orderRouter = express.Router()


orderRouter.post('/', creatOrder)
orderRouter.get('/', (req, res) => {
    // Handle GET / by redirecting to /1/10 (default pagination)
    req.params.page = req.query.page || 1;
    req.params.limit = req.query.limit || 10;
    getOrders(req, res);
});
orderRouter.get('/:page/:limit', getOrders)
orderRouter.patch('/:orderId', updateOrder)
orderRouter.put('/:orderId', updateOrder)

export default orderRouter