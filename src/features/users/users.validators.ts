import { body, param } from "express-validator";
import { Users } from "./users.model";

const usersModel = new Users();

export const validateUserId = () => {
  return [
    param("userId")
      .isInt({ min: 1 })
      .withMessage("400 - must be a positive integer")
      .bail()
      .custom(async (value, _) => {
        const user = await usersModel.findUnique({ id: +value });
        if (!user) {
          throw new Error();
        }
      })
      .withMessage("404"),
  ];
};

export const validateUpdate = () => {
  return [
    param("email")
      .optional()
      .isEmail()
      .withMessage("400 - must be a valid email address"),
    body("password")
      .optional()
      .isString()
      .isLength({ min: 6 })
      .withMessage("400 - must be a string of at least 6 characters"),
    body("firstName")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("400 - invalid"),
    body("lastName")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("400 - invalid"),
    body("address")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("400 - invalid"),
  ];
};

// AUTH
export const validateRegister = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("400 - must be a valid email address")
      .bail()
      .custom(async (email, _) => {
        const user = await usersModel.findUnique({ email });
        if (user) {
          throw new Error();
        }
      })
      .withMessage("400 - already used"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("400 - must be a string of at least 6 characters"),
  ];
};

export const validateLogin = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("400 - must be a valid email address")
      .bail()
      .custom(async (email, _) => {
        const user = await usersModel.findUnique({ email });
        if (!user) {
          throw new Error();
        }
      })
      .withMessage("404"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("400 - must be a string of at least 6 characters"),
  ];
};
