import { Prisma } from "@prisma/client";
import { Response } from "express";
import { ReqUser } from "../../../../types/reqUser";
import { Users } from "../../users.model";
import { Orders } from "../orders.model";

export const create = async (req: ReqUser, res: Response) => {
  // Getting data
  const userId = req.user.id;

  // Declaring models
  const usersModel = new Users();
  const ordersModel = new Orders();

  // Checks
  const user = await usersModel.findUnique({ id: userId });
  if (!user) {
    return;
  }

  // Creating the order

  const newOrder: Prisma.OrderCreateInput = {
    shippingFirstName: req.body.shippingFirstName,
    shippingLastName: req.body.shippingLastName,
    shippingAddress: req.body.shippingAddress,
    creditCardLastDigits: req.body.creditCardLastDigits,
    User: {
      connect: {
        id: user.id,
      },
    },
    orderItems: {
      connect: user.cart.map((oi) => {
        return {
          id: oi.id,
        };
      }),
    },
    totalPrice: user.cart.reduce((prev, curr) => prev + curr.totalPrice, 0),
  };
  const order = await ordersModel.create(newOrder);

  await usersModel.update(userId, {
    cart: {
      disconnect: user.cart.map((oi) => {
        return {
          id: oi.id,
        };
      }),
    },
  });
  res.status(201).json({
    status: "success",
    data: order,
  });
};
