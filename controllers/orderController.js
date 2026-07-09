import Order from "../models/order.js";
import Product from "../models/product.js";
import { hasManagementAccess } from "./userController.js";

export async function creatOrder(req, res) {
    try {
        if (req.user == null) {
            res.status(401).json({ message: 'Please login to creat product !' })
            return
        }

        const { address, phone, notes } = req.body;

        const latestOrder = await Order.find().sort({ date: -1 })
        let orderId = 'WEBBASE0202'

        if (latestOrder.length > 0) {
            const lastOrderIdString = latestOrder[0].orderId
            const lastOrderIdWithoutPrefix = lastOrderIdString.replace('WEBBASE', '')
            const lastOrderIdInteger = parseInt(lastOrderIdWithoutPrefix)
            const newOrderIdInteger = lastOrderIdInteger + 1;
            const newOrderIdWithoutInteger = newOrderIdInteger.toString().padStart(4, '0')
            orderId = 'WEBBASE' + newOrderIdWithoutInteger
        }

        const items = []
        let total = 0

        if (req.body.items !== null && Array.isArray(req.body.items)) {
            for (let i = 0; i < req.body.items.length; i++) {
                let item = req.body.items[i]

                let product = await Product.findOne({
                    productId: item.productId
                })

                if (product == null) {
                    res.status(400).json({ message: 'Invalid Product Id' + item.productId })
                    return
                }

                const itemQty = item.qty || item.qyt || 1;
                const itemTotal = product.price * itemQty;

                items[i] = {
                    productId: product.productId,
                    name: product.productName || item.name || "Product",
                    image: product.images && product.images.length > 0 ? product.images[0] : "no-image.jpg",
                    price: product.price.toString(),
                    qty: itemQty,
                    total: itemTotal
                }

                total += itemTotal
            }
        } else {
            res.status(400).json({ message: 'Invalid Items Fomat' })
            return
        }

        const order = new Order(
            {
                orderId: orderId,
                email: req.user.email,
                name: req.user.firstName + ' ' + req.user.lastName,
                address: address,
                phone: phone,
                items: items,
                total: total,
                notes: notes
            }
        )

        const result = await order.save()

        console.log(result)
        res.json({
            message: 'Order Created Successfully!',
            result: result
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export async function getOrders(req, res) {
    const page = parseInt(req.params.page) || 1
    const limit = parseInt(req.params.limit) || 10
    if (req.user == null) {
        res.status(401).json({
            message: 'Please login to view orders'
        })
        return
    }

    try {
        if (req.user.role == 'admin') {
            const orderCount = await Order.countDocuments()
            const totalPages = Math.ceil(orderCount / limit) //Database Eke Thyena Data Arround Krnawa
            const orders = await Order.find().skip((page - 1) * limit).limit(limit).sort({ date: -1 })
            res.json({
                orders: orders,
                totalPages: totalPages
            })
        }
        else {
            const orderCount = await Order.countDocuments({ email: req.user.email })
            const totalPages = Math.ceil(orderCount / limit)
            const orders = await Order.find({ email: req.user.email }).skip((page - 1) * limit).limit(limit).sort({ date: -1 })
            res.json({
                orders: orders,
                totalPages: totalPages
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Faild to fetch error'
        })
    }
}

export function updateOrder(req, res) {
    try {
        if (req.user && hasManagementAccess(req)) {
            const orderId = req.params.orderId;
            const body = req.body || {};

            // Build update object with allowed fields
            const updateData = {};

            if (body.status) {
                updateData.status = body.status;
            }
            if (body.notes) {
                updateData.notes = body.notes;
            }
            if (body.review) {
                updateData.review = body.review;
            }
            if (body.rating) {
                updateData.rating = body.rating;
            }
            if (body.approval) {
                updateData.approval = body.approval;
            }

            // At least one field must be provided
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: "At least one field (status, notes, review, rating, approval) is required"
                });
            }

            Order.findOneAndUpdate(
                { orderId: orderId },
                updateData,
                { new: true }
            )
                .then((updatedOrder) => {
                    if (updatedOrder) {
                        return res.json({
                            message: "Order updated successfully",
                            order: updatedOrder
                        });
                    } else {
                        return res.status(404).json({
                            message: "Order not found"
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error updating order:', error);
                    return res.status(500).json({
                        message: "Failed to update order due to database error"
                    });
                });

        } else {
            return res.status(403).json({
                message: 'You are not authorized to update orders'
            });
        }
    } catch (err) {
        console.error('System Error:', err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}