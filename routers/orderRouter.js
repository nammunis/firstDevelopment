import express from "express";
import { creatOrder, getOrders, updateOrder } from "../controllers/orderController.js";

const orderRouter = express.Router()


orderRouter.post('/', creatOrder)
orderRouter.get('/:page/:limit', getOrders)
orderRouter.put('/:orderId', updateOrder)

export default orderRouter