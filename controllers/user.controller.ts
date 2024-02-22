import { prisma, response } from "../utils";
import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcryptjs";

export default class UserController {
  static async createUser(req: Request, res: Response) {
    const requestSchema = Joi.object({
      name: Joi.string().required().max(20),
      email: Joi.string().email().required(),
      password: Joi.string().required().min(6).max(20),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    const { password, email, name } = value;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const profilePictureUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${name}`;

    try {
      const existingEmailUser = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (existingEmailUser)
        return response(res, 400, "A user with that email already exists");
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          profile: {
            create: {
              profilePicture: profilePictureUrl,
              bio: "Taskade User",
            },
          },
        },

        include: {
          profile: true,
        },
      });

      const { password, ...others } = user;

      return response(res, 201, "Account created successfully", others);
    } catch (error: any) {
      console.log(error);
      return response(res, 400, error);
    }
  }

  static async getUserById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const { id } = value;

    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },

      select: {
        password: false,
        profile: true,
        email: true,
        name: true,
        tasks: true,
      },
    });

    if (!user) return response(res, 404, "User with given id not found");

    return response(res, 200, "User fetched successfully", user);
  }

  static async getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: {
        password: false,
        profile: true,
        name: true,
        email: true,
        tasks: true,
      },
    });

    return response(res, 200, "Users fetched successfully", users);
  }
}
