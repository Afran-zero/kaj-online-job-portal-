import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import nodemailer from "nodemailer";

// Configure nodemailer transporter for Yahoo
const transporter = nodemailer.createTransport({
    service: 'yahoo',
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER.trim(), // Trim any whitespace
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Only for testing, remove in production
    },
    debug: true,
    logger: true
});

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
        console.log('Register request body:', req.body);
        console.log('Register file:', req.file);

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields (fullname, email, phoneNumber, password, role) are required",
                success: false
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
                success: false
            });
        }

        const file = req.file;
        let profilePhotoUrl = '';
        if (file) {
            try {
                const fileUri = getDataUri(file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: 'image'
                });
                profilePhotoUrl = cloudResponse.secure_url;
                console.log('Cloudinary upload success:', profilePhotoUrl);
            } catch (cloudError) {
                console.error('Cloudinary upload error:', cloudError);
                return res.status(500).json({
                    message: "Failed to upload profile photo to Cloudinary",
                    success: false
                });
            }
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists with this email',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '24h' });

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl,
            },
            isVerified: false, // Set to false for email verification flow
            verificationToken
        });

        // Send verification email (disabled until SMTP is fixed)
       
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Email Address',
                html: `
                    <h3>Welcome to Our Platform!</h3>
                    <p>Please verify your email by clicking the link below:</p>
                    <a href="${verificationUrl}">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                `
            });
            console.log('Verification email sent to:', email);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            return res.status(500).json({
                message: "Failed to send verification email, but account created",
                success: true
            });
        }
        

        return res.status(201).json({
            message: "Account created successfully. Please verify your email.",
            success: true
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            message: "Server error during registration",
            success: false
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log('Login request body:', req.body);

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "All fields (email, password, role) are required",
                success: false
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role",
                success: false
            });
        }

        const tokenData = {
            userId: user._id
        };
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200)
            .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
            .json({
                message: `Welcome back ${user.fullname}`,
                user,
                success: true
            });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: "Server error during login",
            success: false
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        console.log('Verify email token:', token);

        if (!token) {
            return res.status(400).json({
                message: "Verification token is missing",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ email: decoded.email, verificationToken: token });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token",
                success: false
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return res.status(200).json({
            message: "Email verified successfully",
            success: true
        });
    } catch (error) {
        console.error('Verify email error:', error);
        return res.status(500).json({
            message: "Server error during email verification",
            success: false
        });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Resend verification email:', email);

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "Email is already verified",
                success: false
            });
        }

        const verificationToken = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '24h' });
        user.verificationToken = verificationToken;
        await user.save();

        // Send verification email (disabled until SMTP is fixed)
        
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <h3>Welcome to Our Platform!</h3>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
            `
        });
        console.log('Verification email resent to:', email);
        

        return res.status(200).json({
            message: "Verification email resent successfully (email sending disabled)",
            success: true
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            message: "Failed to resend verification email",
            success: false
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Forgot password email:', email);

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send password reset email (disabled until SMTP is fixed)
    
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password',
            html: `
                <h3>Password Reset Request</h3>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
        console.log('Password reset email sent to:', email);
        

        return res.status(200).json({
            message: "Password reset link sent to your email (email sending disabled)",
            success: true
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            message: "Server error during forgot password",
            success: false
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { password } = req.body;
        console.log('Reset password token:', token);

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({
            _id: decoded.userId,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successfully",
            success: true
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            message: "Server error during password reset",
            success: false
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            message: "Server error during logout",
            success: false
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        console.log('Update profile body:', req.body);
        console.log('Update profile file:', file);

        let cloudResponse;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            console.log('Cloudinary upload success:', cloudResponse.secure_url);
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        const userId = req.id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;
        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            message: "Server error during profile update",
            success: false
        });
    }
};

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }

        req.id = decode.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false
        });
    }
};