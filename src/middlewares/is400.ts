import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export default (req: Request, res: Response, next: NextFunction) => {
  const fails = validationResult(req);
  if (!fails.isEmpty()) {
    const fails400 = fails
      .array()
      .filter((err) => err.msg.startsWith("400 - "));
    if (fails400.length) {
      const failObj: any = {};
      fails400.forEach((err) => {
        failObj[err.param] = err.msg.substring("400 - ".length);
      });
      res.status(400).json({
        status: "fail",
        data: failObj,
      });
      return;
    }
  }
  next();
};
