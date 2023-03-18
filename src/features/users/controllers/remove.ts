import { Response } from "express";
import { ReqUser } from "../../../types/reqUser";
import { Users } from "../users.model";

export const remove = async (req: ReqUser, res: Response) => {
  const usersModel = new Users();
  if (req.user.id !== +req.params.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  const user = await usersModel.deleteUnique({ id: +req.params.userId });
  res.json({
    status: "success",
    data: user,
  });
};
