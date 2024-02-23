import express from "express";
import { AuthController } from "../controllers";
import { useLoginRateLimiter, useLoginSlowDown, useForgotPasswordLimiter } from "../middlewares";

const authRouter = express.Router();

authRouter.post("/login", [useLoginRateLimiter, useLoginSlowDown], AuthController.login);
authRouter.post("/logout",  AuthController.logout);
authRouter.post("/forgot-password", [useForgotPasswordLimiter], AuthController.forgotPassword);
authRouter.post("/reset-password", [useForgotPasswordLimiter], AuthController.resetPassword);
authRouter.get("/refresh", AuthController.refreshAccessToken);

export default authRouter;
