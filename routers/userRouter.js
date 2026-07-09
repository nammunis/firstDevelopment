import express from "express";
import { createUser, getUser, getAllUsers, googleLogin, loginUser, makeUserAdmin, resetPassword, sendOTP, verifyEmailWithOTP, updateUserStatus, updateUser, updateUserProfile, deleteUser, updateUserRole, toggleUserBlock } from "../controllers/userController.js";



const userRouter = express.Router()

userRouter.post('/', createUser)
userRouter.get('/', getUser)
userRouter.get('/all-users', getAllUsers)
userRouter.patch('/update-user-status', updateUserStatus)
userRouter.put('/update-profile', updateUserProfile)
userRouter.put('/update-user', updateUser)
userRouter.delete('/delete-user/:userId', deleteUser)
userRouter.post('/login', loginUser)
userRouter.post('/google-login', googleLogin)
userRouter.post('/send-OTP', sendOTP)
userRouter.post('/verify-email', verifyEmailWithOTP)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/make-admin', makeUserAdmin)
userRouter.put('/update-role', updateUserRole)
userRouter.patch('/toggle-block', toggleUserBlock)

export default userRouter;