import request from "supertest";
import config from "config";
import jwt from "jsonwebtoken";
import { Product } from "@prisma/client";

import app from "../../../app";
import { Products } from "../products.model";

const productsModel = new Products();
const jwt_secret: string = config.get("jwt_secret");
const imageUrl =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
const imageUrl2 =
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
const tokenAdmin = jwt.sign(
  {
    id: 1,
    email: "admin@something.com",
    password: "VeryUnsafe",
    role: "ADMIN",
  },
  jwt_secret
);
const tokenUser = jwt.sign(
  {
    id: 2,
    email: "user@something.com",
    password: "VeryUnsafe",
    role: "USER",
  },
  jwt_secret
);

// Tests
describe("Products controllers", () => {
  beforeEach(async () => {
    await productsModel.deleteMany();
  });
  describe("GET /products", () => {
    it("should respond with 200 OK", async () => {
      // Act-Assert
      await request(app)
        .get("/products")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
        });
    });
    it("should respond with 200 OK and 2 product", async () => {
      // Arrange
      const newProduct0 = await productsModel.create({
        name: "Shoes",
        price: 123,
        imageUrl,
        description: "Comfy and Waterproof",
      });
      const newProduct1 = await productsModel.create({
        name: "T-shirt",
        price: 19.99,
        imageUrl,
        description: "Colorful",
      });
      if (!newProduct0 || !newProduct1) {
        throw new Error("Couldn't create the products");
      }

      // Act-Assert
      await request(app)
        .get(`/products`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");

          expect(res.body.data[0].name).toBe(newProduct0.name);
          expect(res.body.data[0].price).toBe(newProduct0.price);
          expect(res.body.data[0].imageUrl).toBe(newProduct0.imageUrl);
          expect(res.body.data[0].description).toBe(newProduct0.description);

          expect(res.body.data[1].name).toBe(newProduct1.name);
          expect(res.body.data[1].price).toBe(newProduct1.price);
          expect(res.body.data[1].imageUrl).toBe(newProduct1.imageUrl);
          expect(res.body.data[1].description).toBe(newProduct1.description);
        });

      // Cleanup
      await productsModel.deleteMany();
    });
  });
  describe("GET /products/:productId", () => {
    it("should respond with 400 Bad Request", async () => {
      // Act-Assert
      await request(app)
        .get("/products/-1")
        .expect(400)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.productId).toBe("must be a positive integer");
        });
    });
    it("should respond with 404 Not Found", async () => {
      // Act-Assert
      await request(app)
        .get("/products/1")
        .expect(404)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.productId).toBe("not found");
        });
    });
    it("should respond with 200 OK", async () => {
      // Arrange
      const newProduct = await productsModel.create({
        name: "Shoes",
        price: 123,
        imageUrl,
        description: "Comfy and Waterproof",
      });
      if (!newProduct) {
        throw new Error("Couldn't create the product");
      }

      // Act-Assert
      await request(app)
        .get(`/products/${newProduct.id}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.name).toBe(newProduct.name);
          expect(res.body.data.price).toBe(newProduct.price);
          expect(res.body.data.imageUrl).toBe(newProduct.imageUrl);
          expect(res.body.data.description).toBe(newProduct.description);
        });

      // Cleanup
      await productsModel.deleteMany();
    });
  });
  describe("POST /products", () => {
    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      const newProduct = {
        name: "Shoes",
        price: 1203,
        imageUrl,
        description: "Comfy and Waterproof",
      };

      await request(app)
        .post("/products")
        .send(newProduct)
        .expect(401)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should return a 403 Forbidden (not admin)", async () => {
      // Act-assert
      const newProduct = {
        name: "Shoes",
        price: 1203,
        imageUrl,
        description: "Comfy and Waterproof",
      };

      await request(app)
        .post("/products")
        .set("authorization", `Bearer ${tokenUser}`)
        .send(newProduct)
        .expect(403)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "You do not have access to this resource"
          );
        });
    });
    it("should return 400 Bad Request (bad price)", async () => {
      // Arrange
      const newProduct = {
        name: "Shoes",
        price: -1,
        imageUrl,
        description: "Comfy and Waterproof",
      };

      // Act-assert
      await request(app)
        .post("/products")
        .send(newProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.price).toBe("must a positive float");
        });
    });
    it("should return 400 Bad Request (bad imageUrl)", async () => {
      // Arrange
      const newProduct = {
        name: "Shoes",
        price: 123,
        imageUrl: "http://somewherewhichdoesntexist.com",
        description: "Comfy and Waterproof",
      };
      // Act-assert
      await request(app)
        .post("/products")
        .send(newProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.imageUrl).toBe(
            "must be a valid URL pointing to an image"
          );
        });
    });
    it("should return 400 Bad Request (duplicate product.name)", async () => {
      // Arrange
      const newProduct = await productsModel.create({
        name: "Shoes",
        price: 123,
        imageUrl,
        description: "Comfy and Waterproof",
      });
      if (!newProduct) {
        throw new Error("Couldn't create the product");
      }

      // Act-assert
      await request(app)
        .post("/products")
        .send({
          name: "Shoes",
          price: 1203,
          imageUrl,
          description: "Comfy and Waterproof",
        })
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.name).toBe(
            "product with similar name already exists"
          );
        });
      // Cleanup
      await productsModel.deleteMany();
    });
    it("should return 201 Created", async () => {
      // Act-assert
      const newProduct = {
        name: "Shoes",
        price: 1203,
        imageUrl,
        description: "Comfy and Waterproof",
      };

      await request(app)
        .post("/products")
        .set("authorization", `Bearer ${tokenAdmin}`)
        .send(newProduct)
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.name).toBe(newProduct.name);
          expect(res.body.data.price).toBe(newProduct.price);
          expect(res.body.data.imageUrl).toBe(newProduct.imageUrl);
          expect(res.body.data.description).toBe(newProduct.description);
        });
      // Cleanup
      await productsModel.deleteMany();
    });
  });
  describe("PUT /products/:productId", () => {
    let product: Product;
    beforeEach(async () => {
      const newProduct = {
        name: "Shoes",
        price: 1203,
        imageUrl,
        description: "Comfy and Waterproof",
      };
      const createdProduct = await productsModel.create(newProduct);
      if (!createdProduct) {
        throw new Error("Couldn't create the product");
      }
      product = createdProduct;
    });
    afterEach(async () => {
      await productsModel.deleteMany();
    });

    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      const updateProduct = {
        name: "Headphones",
        price: 249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      };
      await request(app)
        .put(`/products/${product.id}`)
        .send(updateProduct)
        .expect(401)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should return a 403 Forbidden (not admin)", async () => {
      // Act-assert
      const updateProduct = {
        name: "Headphones",
        price: 249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      };

      await request(app)
        .put(`/products/${product.id}`)
        .set("authorization", `Bearer ${tokenUser}`)
        .send(updateProduct)
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
      const updateProduct = {
        name: "Headphones",
        price: 249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      };
      await request(app)
        .put(`/products/-1`)
        .send(updateProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.productId).toBe("must be a positive integer");
        });
    });
    it("should return 404 Not Found (bad id)", async () => {
      // Act-assert
      const updateProduct = {
        name: "Headphones",
        price: 249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      };
      await request(app)
        .put(`/products/${product.id + 1}`)
        .send(updateProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.productId).toBe("not found");
        });
    });
    it("should return 400 Bad Request (bad price)", async () => {
      const updateProduct = {
        name: "Headphones",
        price: -249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      };
      await request(app)
        .put(`/products/${product.id}`)
        .send(updateProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.price).toBe("must a positive float");
        });
    });
    it("should return 400 Bad Request (bad imageUrl)", async () => {
      const updateProduct = {
        name: "Headphones",
        price: 249.99,
        imageUrl: "http://doesntexistatall.com",
        description: "Listen to stuff!",
      };
      await request(app)
        .put(`/products/${product.id}`)
        .send(updateProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.imageUrl).toBe(
            "must be a valid URL pointing to an image"
          );
        });
    });
    it("should return 400 Bad Request (duplicate product.name)", async () => {
      // Arrange
      await productsModel.create({
        name: "Headphones",
        price: 249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      });
      // Act-Assert
      const updateProduct = {
        name: "Headphones",
        price: 249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      };
      await request(app)
        .put(`/products/${product.id}`)
        .send(updateProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.name).toBe(
            "product with similar name already exists"
          );
        });
    });

    it("should return 200 OK", async () => {
      const updateProduct = {
        name: "Headphones",
        price: 249.99,
        imageUrl: imageUrl2,
        description: "Listen to stuff!",
      };
      await request(app)
        .put(`/products/${product.id}`)
        .send(updateProduct)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.name).toBe(updateProduct.name);
          expect(res.body.data.price).toBe(updateProduct.price);
          expect(res.body.data.imageUrl).toBe(updateProduct.imageUrl);
          expect(res.body.data.description).toBe(updateProduct.description);
        });
    });
  });
  describe("DELETE /products/:productId", () => {
    let product: Product;
    beforeEach(async () => {
      const newProduct = {
        name: "Shoes",
        price: 1203,
        imageUrl,
        description: "Comfy and Waterproof",
      };
      const createdProduct = await productsModel.create(newProduct);
      if (!createdProduct) {
        throw new Error("Couldn't create the product");
      }
      product = createdProduct;
    });
    afterEach(async () => {
      await productsModel.deleteMany();
    });

    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      await request(app)
        .delete(`/products/${product.id}`)
        .expect(401)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "Authentication required to access this resource"
          );
        });
    });
    it("should return a 403 Forbidden (not admin)", async () => {
      // Act-assert
      await request(app)
        .delete(`/products/${product.id}`)
        .set("authorization", `Bearer ${tokenUser}`)
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
        .delete(`/products/-1`)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.productId).toBe("must be a positive integer");
        });
    });
    it("should return 404 Not Found (bad id)", async () => {
      // Act-assert
      await request(app)
        .delete(`/products/${product.id + 1}`)

        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.productId).toBe("not found");
        });
    });
    it("should return 200 OK", async () => {
      await request(app)
        .delete(`/products/${product.id}`)
        .set("authorization", `Bearer ${tokenAdmin}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.name).toBe(product.name);
          expect(res.body.data.price).toBe(product.price);
          expect(res.body.data.imageUrl).toBe(product.imageUrl);
          expect(res.body.data.description).toBe(product.description);
        });
    });
  });
});
