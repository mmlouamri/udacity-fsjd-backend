import request from "supertest";
import config from "config";
import jwt from "jsonwebtoken";
import { OrderItem, Product, User } from "@prisma/client";

import app from "../../../../app";
import { OrderItems } from "../orderItems.model";
import { Users } from "../../users.model";
import { Products } from "../../../products/products.model";

const usersModel = new Users();
const productsModel = new Products();
const orderItemsModel = new OrderItems();
const jwt_secret: string = config.get("jwt_secret");

// Tests
describe("orderItems controllers", () => {
  // @ts-ignore
  let product1: Product;
  let product2: Product;

  let user: User;
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
    });
    if (!createdUser) {
      throw new Error("Couldn't create a new product");
    }
    user = createdUser;
    userToken = jwt.sign(user, jwt_secret);
  });
  afterAll(async () => {
    await orderItemsModel.deleteMany();
    await usersModel.deleteMany();
    await productsModel.deleteMany();
  });
  describe("GET /:userId/orderitems", () => {
    it("should respond with 401 Unauthorized", async () => {
      // Act-Assert
      await request(app)
        .get("/users/1/orderitems")
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
        .get(`/users/${user.id}/orderitems`)
        .set("authorization", `Bearer ${otherUser}`)
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
        .get("/users/-1/orderitems")
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
        .get(`/users/${user.id + 1}/orderitems`)
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
        .get(`/users/${user.id}/orderitems`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
        });
    });
    it("should respond with 200 OK and 2 orderItems", async () => {
      // Arrange
      const newOrderItem0 = await usersModel.update(user.id, {
        cart: {
          create: {
            quantity: 1,
            productId: product1.id,
            totalPrice: product1.price,
          },
        },
      });
      const newOrderItem1 = await usersModel.update(user.id, {
        cart: {
          create: {
            quantity: 2,
            productId: product2.id,
            totalPrice: product2.price * 2,
          },
        },
      });
      if (!newOrderItem0 || !newOrderItem1) {
        throw new Error("Couldn't create the orderItems (update the user)");
      }

      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orderitems`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");

          expect(res.body.data[0].productId).toBe(
            newOrderItem0.cart[0].productId
          );
          expect(res.body.data[0].quantity).toBe(
            newOrderItem0.cart[0].quantity
          );
          expect(res.body.data[0].totalPrice).toBe(
            newOrderItem0.cart[0].totalPrice
          );
          expect(res.body.data[0].product.id).toBe(product1.id);

          expect(res.body.data[1].productId).toBe(
            newOrderItem1.cart[1].productId
          );
          expect(res.body.data[1].quantity).toBe(
            newOrderItem1.cart[1].quantity
          );
          expect(res.body.data[1].totalPrice).toBe(
            newOrderItem1.cart[1].totalPrice
          );
          expect(res.body.data[1].product.id).toBe(product2.id);
        });

      //   // Cleanup
      await orderItemsModel.deleteMany();
    });
  });
  describe("GET /:userId/orderitems/:orderItemId", () => {
    it("should respond with 401 Unauthorized", async () => {
      // Act-Assert
      await request(app)
        .get("/users/1/orderitems/1")
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
      const newOrderItem = await usersModel.update(user.id, {
        cart: {
          create: {
            quantity: 1,
            productId: product1.id,
            totalPrice: product1.price,
          },
        },
      });
      if (!newOrderItem) {
        throw new Error("Couldn't create the orderItem");
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
        .get(`/users/${user.id}/orderitems/${newOrderItem.cart[0].id}`)
        .set("authorization", `Bearer ${otherUser}`)
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
        .get("/users/-1/orderitems/1")
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
        .get(`/users/${user.id + 1}/orderitems/1`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("not found");
        });
    });
    it("should respond with 400 Bad Request (bad orderItemId)", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orderitems/-1`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderItemId).toBe("must be a positive integer");
        });
    });
    it("should respond with 404 Not Found", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orderitems/1`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderItemId).toBe("not found");
        });
    });
    it("should respond with 200 OK", async () => {
      // Arrange
      const newOrderItem = await usersModel.update(user.id, {
        cart: {
          create: {
            quantity: 1,
            productId: product1.id,
            totalPrice: product1.price,
          },
        },
      });
      if (!newOrderItem) {
        throw new Error("Couldn't create the orderItem");
      }

      // Act-Assert
      await request(app)
        .get(`/users/${user.id}/orderitems/${newOrderItem.cart[0].id}`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.quantity).toBe(newOrderItem.cart[0].quantity);
          expect(res.body.data.productId).toBe(product1.id);
          expect(res.body.data.product.id).toBe(product1.id);
        });

      // Cleanup
      await orderItemsModel.deleteMany();
    });
  });
  describe("POST /:userId/orderitems/:orderItemId", () => {
    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      const newOrderItem = {
        productId: product1.id,
        quantity: 2,
      };

      await request(app)
        .post(`/users/${user.id}/orderitems`)
        .send(newOrderItem)
        .expect(401)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should return 404 Not Found (bad product)", async () => {
      // Arrange
      const newOrderItem = {
        productId: product2.id + 1,
        quantity: 2,
      };

      // Act-assert
      await request(app)
        .post(`/users/${user.id}/orderitems`)
        .send(newOrderItem)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.productId).toBe("not found");
        });
    });
    it("should return 400 Bad Request (bad quantity)", async () => {
      // Arrange
      const newOrderItem = {
        productId: product1.id,
        quantity: -2,
      };
      // Act-assert
      await request(app)
        .post(`/users/${user.id}/orderitems`)
        .send(newOrderItem)
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.quantity).toBe("must be a positive integer");
        });
    });
    it("should return 201 Created", async () => {
      // Act-assert
      const newOrderItem = {
        productId: product1.id,
        quantity: 2,
      };

      await request(app)
        .post(`/users/${user.id}/orderitems`)
        .set("authorization", `Bearer ${userToken}`)
        .send(newOrderItem)
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.productId).toBe(newOrderItem.productId);
          expect(res.body.data.quantity).toBe(newOrderItem.quantity);

          expect(res.body.data.totalPrice).toBe(
            product1.price * newOrderItem.quantity
          );
        });
      // Cleanup
      await orderItemsModel.deleteMany();
    });
    it("should return 201 Created and update an existing orderItem", async () => {
      // Act-assert
      const newOrderItem0 = await usersModel.update(user.id, {
        cart: {
          create: {
            quantity: 1,
            productId: product1.id,
            totalPrice: product1.price,
          },
        },
      });
      if (!newOrderItem0) {
        throw new Error("Couldn't create a new orderItem");
      }
      const newOrderItem = {
        productId: product1.id,
        quantity: 2,
      };

      await request(app)
        .post(`/users/${user.id}/orderitems`)
        .set("authorization", `Bearer ${userToken}`)
        .send(newOrderItem)
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.productId).toBe(newOrderItem.productId);
          expect(res.body.data.quantity).toBe(3);
          expect(res.body.data.totalPrice).toBe(product1.price * 3);
        });
      // Cleanup
      await orderItemsModel.deleteMany();
    });
  });
  describe("PUT /:userId/orderitems/:orderItemId", () => {
    let orderItem: OrderItem;
    beforeEach(async () => {
      const newOrderItem = {
        product: { connect: { id: product1.id } },
        quantity: 2,
        totalPrice: product1.price * 2,
        User: {
          connect: {
            id: user.id,
          },
        },
      };
      const createdOrderItem = await orderItemsModel.create(newOrderItem);
      if (!createdOrderItem) {
        throw new Error("Couldn't create the orderItem");
      }
      orderItem = createdOrderItem;
    });
    afterEach(async () => {
      await orderItemsModel.deleteMany();
    });

    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      const updateOrderItem = {
        quantity: 5,
      };
      await request(app)
        .put(`/users/${user.id}/orderitems/${orderItem.id}`)
        .send(updateOrderItem)
        .expect(401)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should return a 403 Forbidden (not same user)", async () => {
      // Act-assert
      const updateOrderItem = {
        quantity: 5,
      };
      const otherUserToken = jwt.sign({ id: -1 }, jwt_secret);
      await request(app)
        .put(`/users/${user.id}/orderitems/${orderItem.id}`)
        .set("authorization", `Bearer ${otherUserToken}`)
        .send(updateOrderItem)
        .expect(403)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "You do not have access to this resource"
          );
        });
    });

    it("should return 400 Bad Request (bad id)", async () => {
      // Act-assert
      const updateOrderItem = {
        quantity: 5,
      };
      await request(app)
        .put(`/users/${user.id}/orderitems/-1`)
        .send(updateOrderItem)
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderItemId).toBe("must be a positive integer");
        });
    });
    it("should return 404 Not Found (bad id)", async () => {
      // Act-assert
      const updateOrderItem = {
        quantity: 5,
      };
      await request(app)
        .put(`/users/${user.id}/orderitems/${orderItem.id + 1}`)
        .send(updateOrderItem)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderItemId).toBe("not found");
        });
    });
    it("should return 400 Bad Request (bad quantity)", async () => {
      const updateOrderItem = {
        quantity: -5,
      };
      await request(app)
        .put(`/users/${user.id}/orderitems/${orderItem.id}`)
        .send(updateOrderItem)
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.quantity).toBe("must be a positive integer");
        });
    });
    it("should return 200 OK", async () => {
      const updateOrderItem = {
        quantity: 5,
      };
      await request(app)
        .put(`/users/${user.id}/orderitems/${orderItem.id}`)
        .send(updateOrderItem)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.quantity).toBe(updateOrderItem.quantity);
          expect(res.body.data.totalPrice).toBe(product1.price * 5);
        });
    });
  });
  describe("DELETE /:userId/orderitems/:orderItemId", () => {
    let orderItem: OrderItem;
    beforeEach(async () => {
      const newOrderItem0 = await usersModel.update(user.id, {
        cart: {
          create: {
            quantity: 1,
            productId: product1.id,
            totalPrice: product1.price,
          },
        },
      });
      if (!newOrderItem0) {
        throw new Error("Couldn't create the product");
      }
      orderItem = newOrderItem0.cart[0];
    });
    afterEach(async () => {
      await orderItemsModel.deleteMany();
    });

    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      await request(app)
        .delete(`/users/${user.id}/orderitems/${orderItem.id}`)
        .expect(401)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should return a 403 Forbidden", async () => {
      // Act-assert
      const user2Token = jwt.sign(
        {
          id: -1,
        },
        jwt_secret
      );
      await request(app)
        .delete(`/users/${user.id}/orderitems/${orderItem.id}`)
        .set("authorization", `Bearer ${user2Token}`)
        .expect(403)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "You do not have access to this resource"
          );
        });
    });
    it("should return 400 Bad Request (bad id)", async () => {
      // Act-assert
      await request(app)
        .delete(`/users/${user.id}/orderitems/-1`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderItemId).toBe("must be a positive integer");
        });
    });
    it("should return 404 Not Found (bad id)", async () => {
      // Act-assert
      await request(app)
        .delete(`/users/${user.id}/orderitems/${orderItem.id + 1}`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.orderItemId).toBe("not found");
        });
    });
    it("should return 200 OK", async () => {
      await request(app)
        .delete(`/users/${user.id}/orderitems/${orderItem.id}`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.productId).toBe(product1.id);
        });
    });
  });
});
