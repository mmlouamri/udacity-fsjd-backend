import { Prisma } from "@prisma/client";
import { Response } from "express";
import { ReqUser } from "../../../../types/reqUser";
import { Products } from "../../../products/products.model";
import { Users } from "../../users.model";
import { OrderItems } from "../orderItems.model";

export const create = async (req: ReqUser, res: Response) => {
  // Request data
  const userId = req.user.id;
  const productId = req.body.productId;

  // Declaring Models

  const orderItemsModel = new OrderItems();
  const productsModel = new Products();
  const usersModel = new Users();

  // Checks
  const product = await productsModel.findUnique({ id: productId });
  const user = await usersModel.findUnique({ id: userId });

  const sameProductInCart = user?.cart.find((oi) => oi.productId === productId);
  // If product is not already in cart
  if (!sameProductInCart) {
    const newOrderItem: Prisma.OrderItemCreateInput = {
      product: {
        connect: {
          id: req.body.productId,
        },
      },
      quantity: req.body.quantity,
      totalPrice: (product?.price || 0) * req.body.quantity,
      User: {
        connect: {
          id: userId,
        },
      },
    };
    const orderItem = await orderItemsModel.create(newOrderItem);
    if (!orderItem) {
      return; //TODO:
    }
    await usersModel.update(userId, {
      cart: {
        connect: { id: orderItem.id },
      },
    });

    res.status(201).json({ status: "success", data: orderItem });
  } else {
    const orderItem = await orderItemsModel.update(sameProductInCart.id, {
      quantity: sameProductInCart.quantity + +req.body.quantity,
      totalPrice:
        sameProductInCart.totalPrice +
        (product?.price || 0) * +req.body.quantity,
    });
    res.status(201).json({ status: "success", data: orderItem });
  }
};
