import { Request, Router, Response } from "express";
import isAuth from "../../../middlewares/isAuth";
import is400 from "../../../middlewares/is400";
import is404 from "../../../middlewares/is404";
import { ReqUser } from "../../../types/reqUser";
import { create, get, remove, show, update } from "./controllers";
import {
  validateCreate,
  validateUpdate,
  validOrderItemId,
} from "./orderItems.validators";
import { validateUserId } from "../users.validators";

const router = Router();

router.get(
  "/:userId/orderitems",
  isAuth,
  validateUserId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    show(req as ReqUser, res);
  }
);

router.get(
  "/:userId/orderitems/:orderItemId",
  isAuth,
  validateUserId(),
  is400,
  is404,
  validOrderItemId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    get(req as ReqUser, res);
  }
);

router.post(
  "/:userId/orderitems/",
  isAuth,
  validateUserId(),
  is400,
  is404,
  validateCreate(),
  is400,
  is404,
  (req: Request, res: Response) => {
    create(req as ReqUser, res);
  }
);

router.put(
  "/:userId/orderitems/:orderItemId",
  isAuth,
  validateUserId(),
  is400,
  is404,
  validOrderItemId(),
  is400,
  is404,
  validateUpdate(),
  is400,
  is404,
  (req: Request, res: Response) => {
    update(req as ReqUser, res);
  }
);
router.delete(
  "/:userId/orderitems/:orderItemId",
  isAuth,
  validateUserId(),
  is400,
  is404,
  validOrderItemId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    remove(req as ReqUser, res);
  }
);
export default router;
