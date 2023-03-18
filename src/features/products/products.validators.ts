import axios from "axios";
import { body, param } from "express-validator";
import { Products } from "./products.model";

const productsModel = new Products();

export const validProductId = () => {
  return [
    param("productId")
      .isInt({ min: 1 })
      .withMessage("400 - must be a positive integer")
      .bail()
      .custom(async (value, _) => {
        const product = await productsModel.findUnique({ id: +value });
        if (!product) {
          throw new Error();
        }
      })
      .withMessage("404"),
  ];
};

export const validateCreate = () => {
  return [
    body("price")
      .isFloat({ min: 0.01 })
      .withMessage("400 - must a positive float"),
    body("name")
      .isString()
      .notEmpty()
      .bail()
      .withMessage("400 - must be a non-empty string")
      .custom(async (name, _) => {
        const product = await productsModel.findUnique({ name });
        if (product) {
          throw new Error("");
        }
      })
      .withMessage("400 - product with similar name already exists"),
    body("description")
      .isString()
      .notEmpty()
      .withMessage("400 - must be a non-empty string"),
    body("imageUrl")
      .isURL()
      .withMessage("400 - must be a valid URL")
      .bail()
      .custom(async (value: string, _) => {
        try {
          const response = await axios.head(value);
          const contentType = response.headers["content-type"];
          if (!contentType.startsWith("image/")) {
            throw new Error();
          }
        } catch (err) {
          throw new Error();
        }
      })
      .withMessage("400 - must be a valid URL pointing to an image"),
  ];
};
export const validateUpdate = () => {
  return [
    body("price")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("400 - must a positive float"),
    body("name")
      .optional()
      .isString()
      .notEmpty()
      .bail()
      .withMessage("400 - must be a non-empty string")
      .custom(async (name, { req }) => {
        const product = await productsModel.findUnique({ name });
        const id = +req?.params?.id;
        if (product && product.id !== id) {
          throw new Error("");
        }
      })
      .withMessage("400 - product with similar name already exists"),
    body("description")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("400 - must be a non-empty string"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("400 - must be a valid URL")
      .bail()
      .custom(async (value, _) => {
        try {
          const response = await axios.head(value, {
            timeout: 2000,
          });
          const contentType = response.headers["content-type"];
          if (!contentType.startsWith("image/")) {
            throw new Error();
          }
        } catch (err) {
          throw new Error();
        }
      })
      .withMessage("400 - must be a valid URL pointing to an image"),
  ];
};
