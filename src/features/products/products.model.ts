import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class Products {
  async findMany(where: Prisma.ProductWhereInput = {}) {
    try {
      const products = await prisma.product.findMany({ where });
      await prisma.$disconnect;

      return products;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async findUnique(where: Prisma.ProductWhereUniqueInput) {
    try {
      const product = await prisma.product.findUnique({
        where,
      });
      await prisma.$disconnect;

      return product;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async create(newProduct: Prisma.ProductCreateInput) {
    try {
      const product = await prisma.product.create({
        data: newProduct,
      });

      await prisma.$disconnect;

      return product;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async update(id: number, updateProduct: Prisma.ProductUpdateInput) {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: updateProduct,
      });
      await prisma.$disconnect;

      return product;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteUnique(where: Prisma.ProductWhereUniqueInput) {
    try {
      const product = await prisma.product.delete({ where });
      await prisma.$disconnect;

      return product;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteMany(where: Prisma.ProductWhereInput = {}) {
    try {
      const products = await prisma.product.deleteMany({ where });
      await prisma.$disconnect;

      return products;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
}
