import { NextFunction, Request, Response } from "express";
import config from "config";
import jwt from "jsonwebtoken";

const jwt_secret: string = config.get("jwt_secret");

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length);
    try {
      const user = jwt.verify(token, jwt_secret);
      //@ts-ignore
      if (user.role === "ADMIN") {
        next();
      } else {
        res.status(403).json({
          status: "fail",
          data: { auth: "You do not have access to this resource" },
        });
        return;
      }
    } catch (err) {
      res.status(401).json({
        status: "fail",
        data: { auth: "Authentication required to access this resource" },
      });
      return;
    }
  } else {
    //Error
    res.status(401).json({
      status: "fail",
      data: { auth: "Authentication required to access this resource" },
    });
    return;
  }
};
