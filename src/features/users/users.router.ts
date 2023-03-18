import { Request, Router, Response } from "express";
import { show, get, update, remove, register, login } from "./controllers";
import is400 from "../../middlewares/is400";
import is404 from "../../middlewares/is404";
import {
  validateUpdate,
  validateRegister,
  validateLogin,
  validateUserId,
} from "./users.validators";

import ordersRouter from "./orders/orders.router";
import orderItemsRouter from "./orderItems/orderItems.router";

import isAuth from "../../middlewares/isAuth";
import { ReqUser } from "../../types/reqUser";
import isAdmin from "../../middlewares/isAdmin";

const router = Router();

router.post(
  "/register",
  validateRegister(),
  is400,
  (req: Request, res: Response) => {
    register(req, res);
  }
);
router.post(
  "/login",

  validateLogin(),
  is400,
  (req: Request, res: Response) => {
    login(req, res);
  }
);

router.use("/", ordersRouter);
router.use("/", orderItemsRouter);

router.get("/", isAdmin, (req: Request, res: Response) => {
  show(req, res);
});

router.get(
  "/:userId",
  isAuth,
  validateUserId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    get(req as ReqUser, res);
  }
);

router.put(
  "/:userId",
  isAuth,
  validateUserId(),
  is400,
  is404,
  validateUpdate(),
  is400,
  (req: Request, res: Response) => {
    update(req as ReqUser, res);
  }
);
router.delete(
  "/:userId",
  isAuth,
  validateUserId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    remove(req as ReqUser, res);
  }
);

export default router;
