import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export default (req: Request, res: Response, next: NextFunction) => {
  const fails = validationResult(req);
  if (!fails.isEmpty()) {
    const fails404 = fails.array().filter((err) => err.msg === "404");
    if (fails404.length) {
      const failObj: any = {};
      fails404.forEach((err) => {
        failObj[err.param] = "not found";
      });
      res.status(404).json({
        status: "fail",
        data: failObj,
      });
      return;
    }
  }
  next();
};
