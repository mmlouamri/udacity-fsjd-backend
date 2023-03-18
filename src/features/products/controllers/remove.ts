import { Request, Response } from "express";
import { Products } from "../products.model";

export const remove = async (req: Request, res: Response) => {
  const productsModel = new Products();
  const product = await productsModel.deleteUnique({
    id: +req.params.productId,
  });
  res.json({
    status: "success",
    data: product,
  });
};
