import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { response } from "../utils";

const useAuth = (req: any, res: any, next: NextFunction) => {
  const tokenFromCookie = req.cookies.accessToken;
  const refreshTokenCookie = req.cookies.refreshToken;

  //just in case of logout
  if (!refreshTokenCookie) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response(res, 401, "Access denied, no refresh token");
  }

  if (!tokenFromCookie) {
    return response(
      res,
      401,
      "You're not authorized to perform this action, no access token!"
    );
  }

  try {
    const JWT_SECRET = process.env.JWT_PRIVATE_KEY as string;

    if (!JWT_SECRET) {
      throw new Error("JWT private key is missing.");
    }

    let decodeCookie = jwt.verify(
      tokenFromCookie,
      JWT_SECRET
    ) as jwt.JwtPayload;

    if (decodeCookie) {
      req.user = decodeCookie;
      next();
    } else {
      return response(res, 401, "Invalid auth token.");
    }
  } catch (error) {
    console.error(error);
    return response(
      res,
      401,
      `You're not authorized to perform this action! ${error}`
    );
  }
};

export default useAuth;
