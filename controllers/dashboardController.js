import Order from "../models/order.js";
import User from "../models/users.js";

export async function getDashboardStats(req, res) {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only admins can view dashboard." });
        }

        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const activeOrders = await Order.countDocuments({ status: "active" });
        const completedOrders = await Order.countDocuments({ status: "completed" });

        const activeCustomers = await User.countDocuments({ isBlocked: false, role: "user" });

        const recentOrders = await Order.find().sort({ date: -1 }).limit(10);

        const allOrders = await Order.find();
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        return res.json({
            statistics: {
                pendingOrders,
                activeOrders,
                completedOrders,
                activeCustomers,
                totalRevenue
            },
            recentOrders
        });
    } catch (err) {
        console.error("Get Dashboard Stats Error:", err);
        return res.status(500).json({ message: "Failed to fetch dashboard stats!" });
    }
}
