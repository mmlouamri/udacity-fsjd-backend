import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { Response } from "express";
import { ReqUser } from "../../../types/reqUser";
import { Users } from "../users.model";

export const update = async (req: ReqUser, res: Response) => {
  const usersModel = new Users();
  if (req.user.id !== +req.params.userId && req.user.role !== "ADMIN") {
    res.status(403).json({
      status: "fail",
      data: {
        auth: "You do not have access to this resource",
      },
    });
    return;
  }
  let updateUser: Prisma.UserUpdateInput = {};
  let updateProfile: Prisma.ProfileUpdateInput = {};

  if (req.body.email) {
    const exists = await usersModel.findMany({ email: req.body.email });
    if (exists && exists.length > 0) {
      res.status(400).json({
        status: "fail",
        data: {
          email: "user with similar email already exists",
        },
      });
      return;
    }
    updateUser.email = req.body.email;
  }
  if (req.body.password) {
    updateUser.password = await bcrypt.hash(req.body.password, 10);
  }
  if (req.body.firstName) {
    updateProfile.firstName = req.body.firstName;
  }
  if (req.body.lastName) {
    updateProfile.lastName = req.body.lastName;
  }
  if (req.body.address) {
    updateProfile.address = req.body.address;
  }
  updateUser = {
    ...updateUser,
    profile: {
      update: updateProfile,
    },
  };
  const user = await usersModel.update(+req.params.userId, updateUser);
  res.json({
    status: "success",
    data: user,
  });
};
