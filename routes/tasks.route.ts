import express from "express";
import { TaskController } from "./../controllers";

const taskRouter = express.Router();

taskRouter.post("/", TaskController.createTask);
taskRouter.get("/", TaskController.getAllTasks);
taskRouter.get("/:id", TaskController.getTaskById);
taskRouter.put("/:id", TaskController.updateTask);
taskRouter.delete("/:id", TaskController.deleteTask);

export default taskRouter;
