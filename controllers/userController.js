import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

dotenv.config();

// Transporter configuration using environment variables
const smtpPort = Number(process.env.SMTP_PORT || 587);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Pass app password via .env file
    },
});

// Helper function to check admin rights
export function isAdmin(req) {
    return req.user?.role === "admin";
}

// Helper function to check if user has management access (admin or manager)
export function hasManagementAccess(req) {
    return req.user?.role === "admin" || req.user?.role === "manager";
}

// Get all users (Admin only)
export async function getAllUsers(req, res) {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({
                message: 'Access denied! Admin only.'
            });
        }

        const users = await User.find().select('-password');
        return res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            message: 'Failed to fetch users'
        });
    }
}

// Update user role (Admin only)
export async function updateUserRole(req, res) {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({
                message: 'Access denied! Admin only.'
            });
        }

        const { userId, role } = req.body;

        // Validate role
        const validRoles = ['user', 'manager', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: 'Invalid role. Must be: user, manager, or admin'
            });
        }

        // Prevent self-demotion
        if (req.user._id.toString() === userId && role !== 'admin') {
            return res.status(400).json({
                message: 'Cannot demote yourself. Please ask another admin.'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role: role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.json({
            message: 'User role updated successfully',
            user: user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({
            message: 'Failed to update user role'
        });
    }
}

// Block/Unblock user (Admin only)
export async function toggleUserBlock(req, res) {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({
                message: 'Access denied! Admin only.'
            });
        }

        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        return res.json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: user
        });
    } catch (error) {
        console.error('Error toggling user block:', error);
        return res.status(500).json({
            message: 'Failed to update user block status'
        });
    }
}

// 1. Create User
export async function createUser(req, res) {
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email.toLowerCase(),
            password: passwordHash,
            phone: req.body.phone,
        });

        await user.save();
        return res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create user!" });
    }
}

// 2. Login User
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account is blocked." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            token,
            message: "Login successful!",
            role: user.role,
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// 3. Get Current User Profile
export async function getUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        return res.json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            image: user.image,
            isEmailVerified: user.isEmailVerified,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}
// 4. Google Login
export async function googleLogin(req, res) {
    const googleToken = req.body.token;

    if (!googleToken) {
        return res.status(400).json({ message: "Token is missing" });
    }

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${googleToken}` },
        });

        let user = await User.findOne({ email: response.data.email.toLowerCase() });

        if (!user) {
            const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = new User({
                email: response.data.email.toLowerCase(),
                firstName: response.data.given_name || "",
                lastName: response.data.family_name || "",
                image: response.data.picture || "",
                role: "user",
                isBlocked: false,
                isEmailVerified: true,
                password: randomPassword,
            });
            await user.save();
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account is blocked." });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            token,
            message: "Login successful!",
            role: user.role,
        });
    } catch (err) {
        console.error("Error fetching Google user info:", err);
        return res.status(500).json({ message: "Failed to authenticate with Google" });
    }
}

// 5. Send OTP
export async function sendOTP(req, res) {
    const { email } = req.body;
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        await OTP.deleteMany({ email: email.toLowerCase() });

        const newOTP = new OTP({ email: email.toLowerCase(), otp: otpCode });
        await newOTP.save();

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            const responsePayload = {
                message: "OTP generated. Email service is not configured on server.",
            };

            if (process.env.NODE_ENV !== "production") {
                responsePayload.devOtp = otpCode;
            }

            return res.status(200).json(responsePayload);
        }

        try {
            await transporter.sendMail({
                from: `FOODSTORE <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Your OTP Code",
                text: `Your OTP code is ${otpCode}`,
            });

            return res.json({ message: "OTP sent successfully!" });
        } catch (mailErr) {
            console.error("OTP Mail Send Error:", mailErr);

            const responsePayload = {
                message: "OTP generated. Email delivery failed, please try again or use resend.",
            };

            if (process.env.NODE_ENV !== "production") {
                responsePayload.devOtp = otpCode;
            }

            return res.status(200).json(responsePayload);
        }
    } catch (err) {
        console.error("OTP Error:", err);
        return res.status(500).json({ message: "Failed to process OTP request" });
    }
}

// Verify email with OTP for logged-in user
export async function verifyEmailWithOTP(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.isEmailVerified) {
            return res.json({
                message: "Email is already verified",
                user: {
                    id: user._id,
                    email: user.email,
                    isEmailVerified: true,
                },
            });
        }

        const otpRecord = await OTP.findOne({
            email: user.email.toLowerCase(),
            otp: String(otp),
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        }

        user.isEmailVerified = true;
        await user.save();
        await OTP.deleteMany({ email: user.email.toLowerCase() });

        return res.json({
            message: "Email verified successfully!",
            user: {
                id: user._id,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (err) {
        console.error("Verify Email Error:", err);
        return res.status(500).json({ message: "Failed to verify email" });
    }
}

// 6. Reset Password
export async function resetPassword(req, res) {
    const { email, newPassword, otp } = req.body;

    try {
        const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        await OTP.deleteMany({ email: email.toLowerCase() });

        return res.json({ message: "Password reset successfully!" });
    } catch (err) {
        console.error("Reset Password Error:", err);
        return res.status(500).json({ message: "Failed to reset password!" });
    }
}

// 7. Make User Admin (for development/setup)
export async function makeUserAdmin(req, res) {
    const { email } = req.body;

    try {
        // Check if user exists first
        const userToPromote = await User.findOne({ email: email.toLowerCase() });
        if (!userToPromote) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Allow promotion if:
        // 1. Requester is already admin, OR
        // 2. There are no admins yet (bootstrap first admin)
        const adminCount = await User.countDocuments({ role: "admin" });

        if (adminCount > 0 && !isAdmin(req)) {
            return res.status(403).json({ message: "Access denied! Only admins can promote users." });
        }

        userToPromote.role = "admin";
        await userToPromote.save();

        return res.json({
            message: "User promoted to admin successfully!",
            user: { email: userToPromote.email, role: userToPromote.role }
        });
    } catch (err) {
        console.error("Make Admin Error:", err);
        return res.status(500).json({ message: "Failed to promote user!" });
    }
}

// 8. Update User Status (Block/Unblock - Admin only)
export async function updateUserStatus(req, res) {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Access denied! Only admins can update user status." });
        }

        const { userId, isBlocked } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required!" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        user.isBlocked = isBlocked;
        await user.save();

        return res.json({
            message: "User status updated successfully!",
            user: { _id: user._id, email: user.email, isBlocked: user.isBlocked }
        });
    } catch (err) {
        console.error("Update User Status Error:", err);
        return res.status(500).json({ message: "Failed to update user status!" });
    }
}

// 10. Update User Profile (Admin only)
export async function updateUser(req, res) {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Access denied! Only admins can update users." });
        }

        const { userId } = req.body;
        const { firstName, lastName, email, phone, role } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required!" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email.toLowerCase();
        if (phone) user.phone = phone;
        if (role && (role === "admin" || role === "user")) user.role = role;

        await user.save();

        return res.json({
            message: "User updated successfully!",
            user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (err) {
        console.error("Update User Error:", err);
        return res.status(500).json({ message: "Failed to update user!" });
    }
}

// 10.5 Update User Profile (User can update their own profile)
export async function updateUserProfile(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const { firstName, lastName, phone } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;

        await user.save();

        return res.json({
            message: "Profile updated successfully!",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        console.error("Update Profile Error:", err);
        return res.status(500).json({ message: "Failed to update profile!" });
    }
}

// 11. Delete User (Admin only)
export async function deleteUser(req, res) {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Access denied! Only admins can delete users." });
        }

        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "userId is required!" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        await User.findByIdAndDelete(userId);

        return res.json({
            message: "User deleted successfully!",
            user: { _id: user._id, email: user.email }
        });
    } catch (err) {
        console.error("Delete User Error:", err);
        return res.status(500).json({ message: "Failed to delete user!" });
    }
}