import express, { Request, Response } from "express";
import cors from "cors";
import productsRouter from "./features/products/products.router";
import userRouter from "./features/users/users.router";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app: express.Application = express();

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiter);
app.use(helmet());
app.use(cors());

app.use("/users", userRouter);
app.use("/products", productsRouter);

app.all("/status", function (_req: Request, res: Response) {
  res.status(200).json({
    status: "success",
    data: "available",
  });
});

app.get("/", function (_req: Request, res: Response) {
  res.send("Udacity - Project 3: Store backend");
});

export default app;
