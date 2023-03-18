import { Request, Response } from "express";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import config from "config";

import { Users } from "../users.model";

const jwt_secret: string = config.get("jwt_secret");

export const login = async (req: Request, res: Response) => {
  const usersModel = new Users();
  const user = await usersModel.findUnique({ email: req.body.email });
  if (!user) {
    res.status(404).json({ status: "fail", data: { email: "not found" } });
    return;
  }
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) {
    res
      .status(401)
      .json({ status: "fail", data: { auth: "Authentication failed" } });
    return;
  }
  const token = jwt.sign(user, jwt_secret);
  res.json({
    status: "success",
    data: { token, user },
  });
};
