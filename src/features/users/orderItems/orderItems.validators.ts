import { body, param } from "express-validator";
import { OrderItems } from "./orderItems.model";
import { Products } from "../../products/products.model";

const orderItemsModel = new OrderItems();
const productsModel = new Products();

export const validOrderItemId = () => {
  return [
    param("orderItemId")
      .isInt({ min: 1 })
      .withMessage("400 - must be a positive integer")
      .bail()
      .custom(async (value, _) => {
        const orderItem = await orderItemsModel.findUnique({ id: +value });
        if (!orderItem) {
          throw new Error();
        }
      })
      .withMessage("404"),
  ];
};

export const validateCreate = () => {
  return [
    body("productId")
      .isInt({
        min: 1,
      })
      .withMessage("400 - must be a positive integer")
      .bail()
      .custom(async (value, _) => {
        const product = await productsModel.findUnique({ id: value });
        if (!product) {
          throw new Error();
        }
      })
      .withMessage("404"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("400 - must be a positive integer"),
  ];
};

export const validateUpdate = () => {
  return [
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("400 - must be a positive integer"),
  ];
};
