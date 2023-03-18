import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

import { Users } from "../users.model";

export const register = async (req: Request, res: Response) => {
  const usersModel = new Users();
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser: Prisma.UserCreateInput = {
    email: req.body.email,
    password: hashedPassword,
  };
  const user = await usersModel.create(newUser);

  res.status(201).json({
    status: "success",
    data: user,
  });
};
