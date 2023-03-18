import { Response } from "express";
import { ReqUser } from "../../../../types/reqUser";
import { Orders } from "../orders.model";

export const get = async (req: ReqUser, res: Response) => {
  const ordersModel = new Orders();
  const orderId = +req.params.orderId;
  const order = await ordersModel.findUnique({ id: orderId });

  if (req.user.id !== +req.params.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  if (order?.userId !== req.user.id) {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }

  res.json({ status: "success", data: order });
};
