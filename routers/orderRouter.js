import express from "express";
import { creatOrder, getOrders } from "../controllers/orderController.js";

const orderRouter = express.Router()


orderRouter.post('/',creatOrder)
orderRouter.get('/:page/:limit',getOrders)

export default orderRouter