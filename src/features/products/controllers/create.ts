import { Request, Response } from "express";
import { Products } from "../products.model";

export const create = async (req: Request, res: Response) => {
  const productsModel = new Products();
  const newProduct = {
    price: req.body.price,
    name: req.body.name,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
  };
  const product = await productsModel.create(newProduct);
  res.status(201).json({
    status: "success",
    data: product,
  });
};
