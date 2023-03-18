import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { Products } from "../products.model";

export const update = async (req: Request, res: Response) => {
  const productsModel = new Products();
  let updateProduct: Prisma.ProductUpdateInput = {};
  if (req.body.price) {
    updateProduct.price = req.body.price;
  }
  if (req.body.name) {
    updateProduct.name = req.body.name;
  }
  if (req.body.description) {
    updateProduct.description = req.body.description;
  }
  if (req.body.imageUrl) {
    updateProduct.imageUrl = req.body.imageUrl;
  }

  const product = await productsModel.update(
    +req.params.productId,
    updateProduct
  );
  res.json({
    status: "success",
    data: product,
  });
};
