import request from "supertest";
import config from "config";
import jwt from "jsonwebtoken";

import app from "../../../../app";
import { Users } from "../../users.model";
import { Products } from "../../../products/products.model";
import { OrderItems } from "../../orderItems/orderItems.model";
import { Orders } from "../orders.model";
import { OrderItem, Product, User } from "@prisma/client";

const usersModel = new Users();
const productsModel = new Products();
const orderItemsModel = new OrderItems();
const ordersModel = new Orders();
const jwt_secret: string = config.get("jwt_secret");

// Tests
describe("orders controllers", () => {
  let product1: Product;
  let product2: Product;

  let user: User & { cart: OrderItem[] };
  let userToken: string;
  beforeAll(async () => {
    const createdProduct1 = await productsModel.create({
      name: "Shoes",
      price: 72,
      imageUrl: "https://img.url",
      description: "Comfy and Waterproof",
    });

    const createdProduct2 = await productsModel.create({
      name: "Book",
      price: 12.99,
      imageUrl: "https://img2.url",
      description: "Can be read",
    });
    if (!createdProduct1 || !createdProduct2) {
      throw new Error("Couldn't create a new product");
    }
    product1 = createdProduct1;
    product2 = createdProduct2;
    const createdUser = await usersModel.create({
      email: "user@test.com",
      password: "123456",
      cart: {
        create: [
          {
            quantity: 2,
            productId: product1.id,
            totalPrice: product1.price * 2,
          },
          {
            quantity: 3,
            productId: product2.id,
            totalPrice: product2.price * 3,
          },
        ],
      },
    });
    if (!createdUser) {
      throw new Error("Couldn't create a new user");
    }
    user = createdUser;
    userToken = jwt.sign(user, jwt_secret);
  });
  beforeEach(async () => {
    const createdUser = await usersModel.update(user.id, {
      cart: {
        create: [
          {
            quantity: 2,
            productId: product1.id,
            totalPrice: product1.price * 2,
          },
          {
            quantity: 3,
            productId: product2.id,
            totalPrice: product2.price * 3,
          },
        ],
      },
    });
    if (!createdUser) {
      throw new Error("Couldn't update the user");
    }
    user = createdUser;
  });
  afterAll(async () => {
    await ordersModel.deleteMany();
    await orderItemsModel.deleteMany();
    await usersModel.deleteMany();
    await productsModel.deleteMany();
  });

  describe("GET /:userId/orders", () => {
    it("should respond with 401 Unauthorized", async () => {
      // Act-Assert
      await request(app)
        .get("/users/1/orders")
        .expect(401)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should respond with 403 Forbidden", async () => {
      const otherUserToken = jwt.sign({ id: -1 }, jwt_secret);
      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orders`)
        .set("authorization", `Bearer ${otherUserToken}`)
        .expect(403)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "You do not have access to this resource"
          );
        });
    });
    it("should respond with 400 Bad Request (bad userId)", async () => {
      // Act-Assert
      await request(app)
        .get("/users/-1/orders")
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("must be a positive integer");
        });
    });
    it("should respond with 404 Not Found (user)", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${user.id + 1}/orders`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("not found");
        });
    });
    it("should respond with 200 OK", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orders`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
        });
    });
    it("should respond with 200 OK and 2 orders", async () => {
      // Arrange
      const newOrder0 = await ordersModel.create({
        shippingFirstName: "Paul",
        shippingLastName: "Georges",
        shippingAddress: "No 221, Somewhere",
        creditCardLastDigits: "1234",
        totalPrice: 1000,
        User: { connect: { id: user.id } },
        orderItems: {
          connect: { id: user.cart[0].id },
        },
      });
      const newOrder1 = await ordersModel.create({
        shippingFirstName: "Thomas",
        shippingLastName: "John",
        shippingAddress: "No 223, Somewhere",
        creditCardLastDigits: "1235",
        totalPrice: 1234,
        User: { connect: { id: user.id } },
        orderItems: {
          connect: { id: user.cart[1].id },
        },
      });
      if (!newOrder0 || !newOrder1) {
        throw new Error("Couldn't create the new order");
      }

      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orders`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");

          expect(res.body.data[0].totalPrice).toBe(newOrder0.totalPrice);
          expect(res.body.data[1].totalPrice).toBe(newOrder1.totalPrice);
        });

      //  Cleanup
      await ordersModel.deleteMany();
    });
  });
  describe("GET /:userId/orders/:orderId", () => {
    it("should respond with 401 Unauthorized", async () => {
      // Act-Assert
      await request(app)
        .get("/users/1/orders/1")
        .expect(401)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should respond with 403 Forbidden", async () => {
      const newOrder = await ordersModel.create({
        shippingFirstName: "Paul",
        shippingLastName: "Georges",
        shippingAddress: "No 221, Somewhere",
        creditCardLastDigits: "1234",
        totalPrice: 1000,
        User: { connect: { id: user.id } },
        orderItems: {
          connect: [{ id: user.cart[0].id }, { id: user.cart[1].id }],
        },
      });
      if (!newOrder) {
        throw new Error("Couldn't create the new order");
      }
      const otherUser = jwt.sign(
        {
          id: user.id + 1,
          email: "user2@test.com",
          password: "123456",
        },
        jwt_secret
      );
      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orders/${newOrder.id}`)
        .set("authorization", `Bearer ${otherUser}`)
        .expect(403)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "You do not have access to this resource"
          );
        });
      await ordersModel.deleteMany();
    });
    it("should respond with 400 Bad Request (bad userId)", async () => {
      // Act-Assert
      await request(app)
        .get("/users/-1/orders/1")
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("must be a positive integer");
        });
    });
    it("should respond with 404 Not Found (user)", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${user.id + 1}/orders/1`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("not found");
        });
    });
    it("should respond with 400 Bad Request (bad orderId)", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orders/-1`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderId).toBe("must be a positive integer");
        });
    });
    it("should respond with 404 Not Found", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orders/1`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderId).toBe("not found");
        });
    });
    it("should respond with 200 OK", async () => {
      const newOrder = await ordersModel.create({
        shippingFirstName: "Paul",
        shippingLastName: "Georges",
        shippingAddress: "No 221, Somewhere",
        creditCardLastDigits: "1234",
        totalPrice: 1000,
        User: { connect: { id: user.id } },
        orderItems: {
          connect: [{ id: user.cart[0].id }, { id: user.cart[1].id }],
        },
      });
      if (!newOrder) {
        throw new Error("Couldn't create the new order");
      }

      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orders/${newOrder.id}`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.totalPrice).toBe(newOrder.totalPrice);
        });

      // Cleanup
      await ordersModel.deleteMany();
    });
  });
  describe("POST /:userId/orders/:orderId", () => {
    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      const newOrder = {
        shippingFirstName: "John",
        shippingLastName: "Dumas",
        shippingAddress: "No 221, Somewhere",
        creditCardLastDigits: "1234",
      };

      await request(app)
        .post(`/users/${user.id}/orders`)
        .send(newOrder)
        .expect(401)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should return 400 Bad Request", async () => {
      // Arrange
      const newOrder = {
        shippingFirstName: "John",
        shippingLastName: "Dumas",
        shippingAddress: "No 221, Somewhere",
        creditCardLastDigits: "abcd",
      };

      // Act-assert
      await request(app)
        .post(`/users/${user.id}/orders`)
        .send(newOrder)
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.creditCardLastDigits).toBe("must be 4 digits");
        });
    });
    it("should return 201 Created", async () => {
      // Act-assert
      const newOrder = {
        shippingFirstName: "John",
        shippingLastName: "Dumas",
        shippingAddress: "No 221, Somewhere",
        creditCardLastDigits: "1234",
      };

      await request(app)
        .post(`/users/${user.id}/orders`)
        .send(newOrder)
        .set("authorization", `Bearer ${userToken}`)
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.shippingFirstName).toBe(
            newOrder.shippingFirstName
          );
        });
      // Cleanup
      await ordersModel.deleteMany();
    });
  });
});
