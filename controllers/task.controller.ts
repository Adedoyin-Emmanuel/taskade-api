import Joi from "joi";
import { Request, Response } from "express";
import { response, prisma } from "./../utils";
import "./../types/types";

export default class TaskController {
  static async createTask(req: Request, res: Response) {
    const requestSchema = Joi.object({
      title: Joi.string().required().max(30),
      description: Joi.string().required().max(2000),
      status: Joi.string().default("pending"),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    const { title, description, status } = value;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        userId: req.user?.id as string,
      },
    });

    return response(res, 201, "Task created successfully", task);
  }

  static async getTaskById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) return response(res, 400, "Task id is required");

    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!task) return response(res, 404, "Task with given id not found");

    return response(res, 200, "Task fetched successfully", task);
  }

  static async getAllTasks(req: Request, res: Response) {
    const allTasks = await prisma.task.findMany();

    return response(res, 200, "Tasks fetched successfully", allTasks);
  }

  static async getCurrentUserTask(req: Request, res: Response) {
    const userTasks = await prisma.task.findMany({
      where: {
        userId: req.user?.id as string,
      },
    });

    return response(res, 200, "Tasks fetched successfully", userTasks);
  }

  static async updateTask(req: Request, res: Response) {
    const requestSchema = Joi.object({
      title: Joi.string().optional().max(30),
      description: Joi.string().optional().max(2000),
      status: Joi.string().valid("success", "pending", "inprogress").optional(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { id } = req.params;

    if (!id) return response(res, 400, "Task id is required");

    const { title, description, status } = value;

    const updatedTask = await prisma.task.update({
      where: {
        id,
      },

      data: {
        title,
        description,
        status,
      },
    });

    if (!updatedTask) return response(res, 404, "Task with given id not found");

    return response(res, 200, "Task updated successfully", updatedTask);
  }

  static async deleteTask(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) return response(res, 400, "Task id is required");

    const task = await prisma.task.delete({
      where: { id },
    });

    if (!task) return response(res, 404, "Task with given id not found");

    return response(res, 200, "Task deleted successfully");
  }
}
