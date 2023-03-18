import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class OrderItems {
  async findMany(where: Prisma.OrderItemWhereInput = {}) {
    try {
      const orderItems = await prisma.orderItem.findMany({
        where,
        include: {
          product: true,
        },
      });
      await prisma.$disconnect;

      return orderItems;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async findUnique(where: Prisma.OrderItemWhereUniqueInput) {
    try {
      const orderItem = await prisma.orderItem.findUnique({
        where,
        include: {
          product: true,
        },
      });
      await prisma.$disconnect;

      return orderItem;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async create(newOrderItem: Prisma.OrderItemCreateInput) {
    try {
      const orderItem = await prisma.orderItem.create({
        data: newOrderItem,
        include: {
          product: true,
        },
      });

      await prisma.$disconnect;

      return orderItem;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async update(id: number, updateOrderItem: Prisma.OrderItemUpdateInput) {
    try {
      const orderItem = await prisma.orderItem.update({
        where: { id },
        include: {
          product: true,
        },
        data: updateOrderItem,
      });
      await prisma.$disconnect;

      return orderItem;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteUnique(where: Prisma.OrderItemWhereUniqueInput) {
    try {
      const orderItem = await prisma.orderItem.delete({
        where,
        include: {
          product: true,
        },
      });
      await prisma.$disconnect;

      return orderItem;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteMany(where: Prisma.OrderItemWhereInput = {}) {
    try {
      const orderItems = await prisma.orderItem.deleteMany({ where });
      await prisma.$disconnect;

      return orderItems;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
}
