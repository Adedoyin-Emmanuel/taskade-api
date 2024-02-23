import { Response } from "express";
import { response, prisma } from "../utils/";
import dayjs from "dayjs";
import { JwtPayload, Secret, sign } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const generateAccessToken = async (res: Response, id: string) => {
  const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY as Secret;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id,
      },

      select: {
        email: true,
        name: true,
        refreshToken: true,
        id: true,
      },
    });

    const payload = {
      id,
      name: user?.name as string,
      email: user?.email as string,
    };

    const accessToken = sign(payload, PRIVATE_KEY, { expiresIn: "15m" });

    const refreshToken =
      user?.refreshToken || sign(payload, PRIVATE_KEY, { expiresIn: "90d" });

    await prisma.user.update({
      where: { id },
      data: {
        refreshToken,
      },
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: dayjs().add(15, "m").toDate(),
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: dayjs().add(90, "days").toDate(),
      path: "/",
    });
  } catch (error: any) {
    console.log(error);
    return response(res, 500, error.message);
  }
};

export default generateAccessToken;
