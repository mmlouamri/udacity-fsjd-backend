import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class Orders {
  async findMany(where: Prisma.OrderWhereInput = {}) {
    try {
      const orders = await prisma.order.findMany({
        where,
        include: { orderItems: true },
      });
      await prisma.$disconnect;

      return orders;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async findUnique(where: Prisma.OrderWhereUniqueInput) {
    try {
      const orders = await prisma.order.findUnique({
        where,
        include: { orderItems: true },
      });
      await prisma.$disconnect;

      return orders;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async create(newOrder: Prisma.OrderCreateInput) {
    try {
      const order = await prisma.order.create({
        data: newOrder,
        include: { orderItems: true },
      });

      await prisma.$disconnect;

      return order;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async update(id: number, updateOrder: Prisma.OrderUpdateInput) {
    try {
      const order = await prisma.order.update({
        where: {
          id,
        },
        data: updateOrder,
        include: { orderItems: true },
      });

      await prisma.$disconnect;

      return order;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteUnique(id: number) {
    try {
      const order = await prisma.order.delete({
        where: {
          id,
        },
        include: { orderItems: true },
      });
      await prisma.$disconnect;

      return order;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteMany(where: Prisma.OrderWhereInput = {}) {
    try {
      const orders = await prisma.order.deleteMany({
        where,
      });
      await prisma.$disconnect;

      return orders;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
}
