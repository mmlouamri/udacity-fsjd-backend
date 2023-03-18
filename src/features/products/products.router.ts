import { Request, Router, Response } from "express";
import isAdmin from "../../middlewares/isAdmin";
import is400 from "../../middlewares/is400";
import is404 from "../../middlewares/is404";
import { show, get, create, update, remove } from "./controllers/";
import {
  validProductId,
  validateCreate,
  validateUpdate,
} from "./products.validators";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  show(req, res);
});

router.get(
  "/:productId",
  validProductId(),
  is400,
  is404,
  (req: Request, res: Response) => {
    get(req, res);
  }
);

router.post(
  "/",
  isAdmin,
  validateCreate(),
  is400,
  (req: Request, res: Response) => {
    create(req, res);
  }
);

router.put(
  "/:productId",
  isAdmin,
  validProductId(),
  is400,
  is404,
  validateUpdate(),
  is400,
  (req: Request, res: Response) => {
    update(req, res);
  }
);

router.delete(
  "/:productId",
  validProductId(),
  is400,
  is404,
  isAdmin,
  (req: Request, res: Response) => {
    remove(req, res);
  }
);
export default router;
