import { Response } from "express";
import { ReqUser } from "../../../../types/reqUser";
import { OrderItems } from "../orderItems.model";

export const show = async (req: ReqUser, res: Response) => {
  const orderItemsModel = new OrderItems();
  if (req.user.id !== +req.params.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  const orderItems = await orderItemsModel.findMany({ userId: +req.user.id });
  res.json({ status: "success", data: orderItems });
};
