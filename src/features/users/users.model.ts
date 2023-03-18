import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class Users {
  async findMany(where: Prisma.UserWhereInput = {}) {
    try {
      const users = await prisma.user.findMany({
        where,
        include: {
          profile: true,
          cart: true,
        },
      });
      await prisma.$disconnect;

      return users;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async findUnique(where: Prisma.UserWhereUniqueInput) {
    try {
      const user = await prisma.user.findUnique({
        where,
        include: {
          profile: true,
          cart: true,
        },
      });
      await prisma.$disconnect;

      return user;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async create(newUser: Prisma.UserCreateInput) {
    try {
      const user = await prisma.user.create({
        data: {
          ...newUser,
          profile: {
            create: {
              firstName: "",
              lastName: "",
              address: "",
            },
          },
        },
        include: {
          cart: true,
          profile: true,
        },
      });
      await prisma.$disconnect;

      return user;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async update(id: number, updateUser: Prisma.UserUpdateInput) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateUser,
        include: {
          profile: true,
          cart: true,
        },
      });
      await prisma.$disconnect;

      return user;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteUnique(where: Prisma.UserWhereUniqueInput) {
    try {
      const user = await prisma.user.delete({
        where,
      });
      await prisma.$disconnect;

      return user;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
  async deleteMany(where: Prisma.UserWhereInput = {}) {
    try {
      const user = await prisma.user.deleteMany({ where });
      await prisma.$disconnect;

      return user;
    } catch (err) {
      console.error(err);
      await prisma.$disconnect;
    }
  }
}
