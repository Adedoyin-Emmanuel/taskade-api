import express from "express";
import { AuthController } from "../controllers";

const authRouter = express.Router();

authRouter.post("/login", [], AuthController.login);
authRouter.post("/logout", [], AuthController.logout);
authRouter.post("/forgot-password", [], AuthController.forgotPassword);
authRouter.post("/reset-password", [], AuthController.resetPassword);
authRouter.get("/refresh", []);

export default authRouter;
