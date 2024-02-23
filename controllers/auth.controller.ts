import { prisma } from "../utils";
import Joi, { valid } from "joi";
import bcrypt from "bcryptjs";
import {
  response,
  sendResetPasswordEmail,
  generateOTP,
  generateAccessToken,
} from "../utils";
import { Request, Response } from "express";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { sign } from "jsonwebtoken";

export default class AuthController {
  static async login(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().max(20).min(6),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    const { email, password } = value;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        password: true,
        profile: true,
        email: true,
        name: true,
        tasks: true,
        id: true,
      },
    });

    if (!user) {
      /*The email doesn't exist but we confuse the user to think it is an invalid, 
            just in case of an hacker trying to exploit 😂*/
      return response(res, 400, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!validPassword) {
      return response(res, 400, "Invalid credentials");
    }

    await generateAccessToken(res, user.id);

    const { password: hashedPasswordFromDb, ...userWithoutPassword } = user;

    return response(res, 200, "Login successful", userWithoutPassword);
  }
  static async forgotPassword(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    const { email } = value;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      return response(
        res,
        404,
        "There is no account accociated with this email"
      );

    const otp = generateOTP();

    sendResetPasswordEmail(
      "Password Rest",
      user?.email as string,
      user?.name as string,
      otp
    );

    await prisma.user.update({
      where: { email },
      data: {
        otp: otp,
        otpExpiry: dayjs().add(1, "hour").toISOString(),
      },
    });

    return response(res, 200, "OTP Sent to email");
  }

  static async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const JWT_SECRET = process.env.JWT_PRIVATE_KEY as string;

    if (!refreshToken) return response(res, 401, "Invalid token");

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;
    if (!decoded) return response(res, 401, "Invalid or expired token");

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) return response(res, 401, "Invalid or expired token");

    const accessToken = sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: dayjs().add(15, "m").toDate(),
      path: "/",
    });

    return response(res, 200, "Access token generated successfully");
  }

  static async resetPassword(req: Request, res: Response) {
    const requestSchema = Joi.object({
      otp: Joi.string().required(),
      password: Joi.string().required().max(20).min(6),
      confirmPassword: Joi.string().required().max(20).min(6),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { otp, password, confirmPassword } = value;

    if (password !== confirmPassword)
      return response(res, 400, "Password does not match");

    const user = await prisma.user.findFirst({
      where: { otp },
    });

    if (!user) return response(res, 400, "Invalid or expired OTP");

    if (dayjs().isAfter(user.otpExpiry))
      return response(res, 400, "Invalid or expired OTP");

    await prisma.user.update({
      where: {
        email: user.email,
      },

      data: {
        password: bcrypt.hashSync(password, 10),
        otp: "",
        otpExpiry: null,
      },
    });

    return response(res, 200, "Password reset successful");
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return response(res, 200, "Logout successful");
  }
}
