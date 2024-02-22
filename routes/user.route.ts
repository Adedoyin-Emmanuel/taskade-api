import express from "express";
import { UserController } from "../controllers";

const userRouter = express.Router();

userRouter.post("/", [], UserController.createUser);
userRouter.get("/:id", [], UserController.getUserById);
userRouter.get("/", [], UserController.getAllUsers);

export default userRouter;
