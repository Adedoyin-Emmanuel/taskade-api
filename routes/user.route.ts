import express from "express";
import { UserController } from "../controllers";
import { useCreateUserLimiter, useAuth } from "../middlewares";

const userRouter = express.Router();

userRouter.post("/", [useCreateUserLimiter], UserController.createUser);
userRouter.get("/:id", UserController.getUserById);
userRouter.get("/", UserController.getAllUsers);
userRouter.put("/:id", [useAuth], UserController.updateUser);
userRouter.delete("/:id", [useAuth], UserController.deleteUser);

export default userRouter;
