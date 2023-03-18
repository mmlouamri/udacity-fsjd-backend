import { Response } from "express";
import { ReqUser } from "../../../../types/reqUser";
import { OrderItems } from "../orderItems.model";

export const update = async (req: ReqUser, res: Response) => {
  const orderItemsModel = new OrderItems();
  const oldOrderItem = await orderItemsModel.findUnique({
    id: +req.params.orderItemId,
  });

  if (req.user.id !== +req.params.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  if (!oldOrderItem) {
    return;
  }

  if (oldOrderItem.userId !== req.user.id) {
    res.status(403).json({
      status: "fail",
      data: { auth: "You do not have access to this resource" },
    });
    return;
  }
  const orderItem = await orderItemsModel.update(+req.params.orderItemId, {
    quantity: req.body.quantity,
    totalPrice: req.body.quantity * oldOrderItem?.product.price,
  });

  res.json({ status: "success", data: orderItem });
};
