import express from "express";
import { creatUser, getUser, loginUser } from "../controllers/userController.js";



const userRouter = express.Router()

userRouter.post('/',creatUser)
userRouter.get('/',getUser)
userRouter.post('/login',loginUser)

export default userRouter;