import { Request, Router, Response } from "express";
import isAuth from "../../../middlewares/isAuth";
import is400 from "../../../middlewares/is400";
import is404 from "../../../middlewares/is404";
import { ReqUser } from "../../../types/reqUser";
import { get, show, create } from "./controllers/";

import { validateUserId } from "../users.validators";
import { validateCreate, validateOrderId } from "./orders.validators";

const router = Router();
router.get(
  "/:userId/orders",
  isAuth,
  validateUserId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    show(req as ReqUser, res);
  }
);
router.get(
  "/:userId/orders/:orderId",
  isAuth,
  validateUserId(),
  is400,
  is404,
  validateOrderId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    get(req as ReqUser, res);
  }
);

router.post(
  "/:userId/orders",
  isAuth,
  validateUserId(),
  is400,
  is404,
  validateCreate(),
  is400,
  (req: Request, res: Response) => {
    create(req as ReqUser, res);
  }
);
export default router;
