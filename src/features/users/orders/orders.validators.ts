import { body, param } from "express-validator";
import { Orders } from "./orders.model";
const ordersModel = new Orders();

export const validateOrderId = () => {
  return [
    param("orderId")
      .isInt({ min: 1 })
      .withMessage("400 - must be a positive integer")
      .bail()
      .custom(async (value, _) => {
        const user = await ordersModel.findUnique({ id: +value });
        if (!user) {
          throw new Error();
        }
      })
      .withMessage("404"),
  ];
};

export const validateCreate = () => {
  return [
    body("shippingFirstName").isString().withMessage("400 - must be a string"),
    body("shippingLastName").isString().withMessage("400 - must be a string"),
    body("shippingAddress").isString().withMessage("400 - must be a string"),
    body("creditCardLastDigits")
      .isString()
      .isLength({ min: 4, max: 4 })
      .custom((value: string, _) => {
        const n = Number(value);
        if (Number.isNaN(n)) {
          return false;
        }
        return true;
      })
      .withMessage("400 - must be 4 digits"),
  ];
};
