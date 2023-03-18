import { Response } from "express";
import { ReqUser } from "../../../../types/reqUser";
import { OrderItems } from "../orderItems.model";

export const remove = async (req: ReqUser, res: Response) => {
  const orderItemsModel = new OrderItems();
  const orderItem = await orderItemsModel.findUnique({
    id: +req.params.orderItemId,
  });
  if (req.user.id !== +req.params.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  if (!orderItem) {
    return;
  }

  if (orderItem.userId !== req.user.id) {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  await orderItemsModel.deleteUnique({ id: +req.params.orderItemId });
  res.json({ status: "success", data: orderItem });
};
