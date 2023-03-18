import { Request, Response } from "express";
import { Users } from "../users.model";

export const show = async (_req: Request, res: Response) => {
  const usersModel = new Users();
  const users = await usersModel.findMany();
  res.json({
    status: "success",
    data: users,
  });
};
