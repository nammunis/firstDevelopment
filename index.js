import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRouter from "./routers/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routers/productRouters.js";
import dotenv from "dotenv";
import cors from 'cors';
import orderRouter from "./routers/orderRouter.js";
import dashboardRouter from "./routers/dashboardRouter.js";
import reviewRouter from "./routers/reviewRouter.js";
dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
    const value = req.header("Authorization");

    if (value != null && value.startsWith("Bearer ")) {
        const token = value.replace("Bearer ", "");

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err || !decoded) {
                return res.status(403).json({
                    message: 'Unauthorized or Token Expired'
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        next();
    }
});

const connectionString = process.env.MONGO_URL;

mongoose.connect(connectionString).then(
    () => {
        console.log('Database Connected !✅');
    }
).catch(
    (err) => {
        console.log('Database Connected Failed ❌');
        console.error(err);
    }
);

app.use('/user', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reviews', reviewRouter);

app.delete('/', (req, res) => {
    console.log('This Is Delete Request');
    res.json({ message: 'Delete Request Done !' });
});

const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
});