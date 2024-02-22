import express from "express";
import { UserController } from "../controllers";

const userRouter = express.Router();

userRouter.post("/", [], UserController.createUser);
userRouter.get("/:id", [], UserController.getUserById);
userRouter.get("/", [], UserController.getAllUsers);
userRouter.put("/:id", [], UserController.updateUser);
userRouter.delete("/:id", [], UserController.deleteUser);

export default userRouter;
