import express from "express";
import { TaskController } from "./../controllers";
import { useAuth } from "../middlewares";

const taskRouter = express.Router();

taskRouter.post("/", [useAuth], TaskController.createTask);
taskRouter.get("/", [useAuth], TaskController.getAllTasks);
taskRouter.get("/:id", [useAuth], TaskController.getTaskById);
taskRouter.get("/me", [useAuth], TaskController.getCurrentUserTask);
taskRouter.put("/:id", [useAuth], TaskController.updateTask);
taskRouter.delete("/:id", [useAuth], TaskController.deleteTask);

export default taskRouter;
