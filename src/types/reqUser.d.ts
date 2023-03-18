import { User } from "@prisma/client";
import { Request } from "express";

interface ReqUser extends Request {
  user: User;
}
