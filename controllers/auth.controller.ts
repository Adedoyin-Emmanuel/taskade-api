import { prisma } from "../utils";
import Joi, { valid } from "joi";
import bcrypt from "bcryptjs";
import { response, sendResetPasswordEmail, generateOTP } from "../utils";
import { Request, Response } from "express";
import dayjs from "dayjs";

class AuthController {
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

    // generate accessToken

    return response(res, 200, "Login successful", user);
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

    if (!email)
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
