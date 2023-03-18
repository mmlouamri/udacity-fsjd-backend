import { Response } from "express";
import { ReqUser } from "../../../../types/reqUser";
import { Orders } from "../orders.model";

export const show = async (req: ReqUser, res: Response) => {
  const ordersModel = new Orders();
  if (req.user.id !== +req.params.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  const orders = await ordersModel.findMany({
    userId: +req.params.userId,
  });

  res.json({ status: "success", data: orders });
};
