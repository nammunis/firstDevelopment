import express from "express";
import { creatOrder, getOrders } from "../controllers/orderController.js";

const orderRouter = express.Router()


orderRouter.post('/',creatOrder)
orderRouter.get('/',getOrders)

export default orderRouter