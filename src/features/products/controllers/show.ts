import { Request, Response } from "express";
import { Products } from "../products.model";

export const show = async (_req: Request, res: Response) => {
  const productsModel = new Products();
  const products = await productsModel.findMany();
  res.json({
    status: "success",
    data: products,
  });
};
