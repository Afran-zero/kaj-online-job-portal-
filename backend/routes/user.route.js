import express from "express";
import { register, login, logout, updateProfile, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword} from '../controllers/user.controller.js';
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router()

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
router.route('/verify-email').get(verifyEmail);
router.route('/resend-verification').post(resendVerificationEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

export default router;

 