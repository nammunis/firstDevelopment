import Order from "../models/order.js";
import User from "../models/users.js";

// Dashboard Statistics - Admin only
export async function getDashboardStats(req, res) {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only admins can view dashboard." });
        }

        // Get order statistics
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const activeOrders = await Order.countDocuments({ status: "active" });
        const completedOrders = await Order.countDocuments({ status: "completed" });

        // Get active customers (users who are not blocked)
        const activeCustomers = await User.countDocuments({ isBlocked: false, role: "user" });

        // Get recent orders (last 10)
        const recentOrders = await Order.find().sort({ date: -1 }).limit(10);

        // Calculate total revenue
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
