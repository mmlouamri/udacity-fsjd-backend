import request from "supertest";
import config from "config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

import app from "../../../app";
import { Users } from "../users.model";

const usersModel = new Users();
const jwt_secret: string = config.get("jwt_secret");

// Tests
describe("Users controllers", () => {
  let user: User;
  let admin: User;
  let userToken: string;
  let adminToken: string;
  beforeAll(async () => {
    const createdUser = await usersModel.create({
      email: "user@test.com",
      password: await bcrypt.hash("123456", 10),
    });
    const createdAdmin = await usersModel.create({
      email: "admin@test.com",
      password: await bcrypt.hash("123456", 10),
      role: "ADMIN",
    });
    if (!createdUser || !createdAdmin) {
      throw new Error("Couldn't create the new user");
    }
    user = createdUser;
    admin = createdAdmin;
    userToken = jwt.sign(user, jwt_secret);
    adminToken = jwt.sign(admin, jwt_secret);
  });
  afterAll(async () => {
    await usersModel.deleteMany();
  });
  describe("GET /users", () => {
    it("should respond with 401 Unauthorized", async () => {
      // Act-Assert
      await request(app)
        .get("/users")
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
      // Act-Assert
      await request(app)
        .get("/users")
        .set("authorization", `Bearer ${userToken}`)
        .expect(403)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.auth).toBe(
            "You do not have access to this resource"
          );
        });
    });
    it("should respond with 200 OK", async () => {
      // Act-Assert
      await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
        });
    });
    it("should respond with 200 OK and 2 users", async () => {
      // Act-Assert
      await request(app)
        .get(`/users`)
        .set("authorization", `Bearer ${adminToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");

          expect(res.body.data[0].email).toContain(user.email);
          expect(res.body.data[0].password).toBe(user.password);

          expect(res.body.data[1].email).toBe(admin.email);
          expect(res.body.data[1].password).toBe(admin.password);
        });

      // Cleanup
      await usersModel.deleteMany({ password: "toBeDeleted" });
    });
  });
  describe("GET /users/:userId", () => {
    it("should respond with 401 Unauthorized", async () => {
      // Act-Assert
      await request(app)
        .get("/users/1")
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
        .get(`/users/${user.id}`)
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
        .get("/users/-1")
        .set("authorization", `Bearer ${adminToken}`)
        .expect(400)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("must be a positive integer");
        });
    });
    it("should respond with 404 Not Found", async () => {
      // Act-Assert
      await request(app)
        .get(`/users/${admin.id + 1}`)
        .set("authorization", `Bearer ${adminToken}`)
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
        .get(`/users/${user.id}`)
        .set("authorization", `Bearer ${userToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.email).toBe(user.email);
          expect(res.body.data.password).toBe(user.password);
        });
    });
  });
  describe("POST /users/register", () => {
    it("should return 400 Bad Request (bad email)", async () => {
      const newUser = {
        email: "notanemail",
        password: "123456",
      };

      // Act-assert
      await request(app)
        .post("/users/register")
        .send(newUser)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.email).toBe("must be a valid email address");
        });
    });
    it("should return 400 Bad Request (bad email #2)", async () => {
      // E-mail already used
      const newUser = {
        email: "user@test.com",
        password: "123456",
      };

      // Act-assert
      await request(app)
        .post("/users/register")
        .send(newUser)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.email).toBe("already used");
        });
    });
    it("should return 400 Bad Request (bad password)", async () => {
      const newUser = {
        email: "user2@test.com",
        password: "12345",
      };

      // Act-assert
      await request(app)
        .post("/users/register")
        .send(newUser)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.password).toBe(
            "must be a string of at least 6 characters"
          );
        });
    });

    it("should return 201 Created", async () => {
      const newUser = {
        email: "userRegister@test.com",
        password: "123456",
      };

      // Act-assert
      await request(app)
        .post("/users/register")
        .send(newUser)
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.email).toBe(newUser.email);
          expect(res.body.data.password).not.toBe(newUser.password);
        });
      await usersModel.deleteUnique({ email: newUser.email });
    });
  });

  describe("POST /users/login", () => {
    it("should return 400 Bad Request (bad email)", async () => {
      const user = {
        email: "notanemail",
        password: "123456",
      };

      // Act-assert
      await request(app)
        .post("/users/login")
        .send(user)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.email).toBe("must be a valid email address");
        });
    });
    it("should return 400 Bad Request (bad password)", async () => {
      const user = {
        email: "email@test.com",
        password: "12345",
      };

      // Act-assert
      await request(app)
        .post("/users/login")
        .send(user)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.password).toBe(
            "must be a string of at least 6 characters"
          );
        });
    });
    it("should return 404 Not Found", async () => {
      const user = {
        email: "notuser@test.com",
        password: "123456",
      };

      // Act-assert
      await request(app)
        .post("/users/login")
        .send(user)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.email).toBe("not found");
        });
    });

    it("should return 200 OK", async () => {
      // Act-assert
      await request(app)
        .post("/users/login")
        .send({ email: user.email, password: "123456" })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.token).toBeDefined();
        });
    });
  });

  describe("PUT /users/:userId", () => {
    let user2: User;
    beforeAll(async () => {
      const newUser = {
        email: "user2@test.com",
        password: "123456",
      };
      const createdUser = await usersModel.create(newUser);
      if (!createdUser) {
        throw new Error("Couldn't create the user");
      }
      user2 = createdUser;
    });

    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      const updateUser = {
        email: "update@test.com",
        password: "654321",
        firstName: "First",
        lastName: "Last",
        address: "No 221, Somewhere",
      };
      await request(app)
        .put(`/users/${user2.id}`)
        .send(updateUser)
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
      const updateUser = {
        email: "update@test.com",
        password: "654321",
        firstName: "First",
        lastName: "Last",
        address: "No 221, Somewhere",
      };
      await request(app)
        .put(`/users/${user2.id}`)
        .set("authorization", `Bearer ${userToken}`)
        .send(updateUser)
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
      const updateUser = {
        email: "update@test.com",
        password: "654321",
        firstName: "First",
        lastName: "Last",
        address: "No 221, Somewhere",
      };
      await request(app)
        .put(`/users/-1`)
        .send(updateUser)
        .set("authorization", `Bearer ${adminToken}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("must be a positive integer");
        });
    });
    it("should return 404 Not Found (bad id)", async () => {
      // Act-assert
      const updateUser = {
        email: "update@test.com",
        password: "654321",
        firstName: "First",
        lastName: "Last",
        address: "No 221, Somewhere",
      };
      await request(app)
        .put(`/users/${user2.id + 1}`)
        .send(updateUser)
        .set("authorization", `Bearer ${adminToken}`)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("not found");
        });
    });
    it("should return 400 Bad Request (duplicate user.email)", async () => {
      // Act-Assert
      const updateUser = {
        email: "user@test.com",
        password: "654321",
        firstName: "First",
        lastName: "Last",
        address: "No 221, Somewhere",
      };
      await request(app)
        .put(`/users/${user2.id}`)
        .send(updateUser)
        .set("authorization", `Bearer ${adminToken}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.email).toBe(
            "user with similar email already exists"
          );
        });
    });
    it("should return 200 OK", async () => {
      const updateUser = {
        email: "update@test.com",
        password: "654321",
        firstName: "First",
        lastName: "Last",
        address: "No 221, Somewhere",
      };
      const user2Token = jwt.sign(user2, jwt_secret);
      await request(app)
        .put(`/users/${user2.id}`)
        .send(updateUser)
        .set("authorization", `Bearer ${user2Token}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.email).toBe(updateUser.email);
          expect(res.body.data.profile.firstName).toBe(updateUser.firstName);
          expect(res.body.data.profile.lastName).toBe(updateUser.lastName);
          expect(res.body.data.profile.address).toBe(updateUser.address);
        });
    });
  });
  describe("DELETE /users/:userId", () => {
    let user2: User;
    let user2Token: string;
    beforeEach(async () => {
      const newUser = {
        email: "user2@test.com",
        password: "123456",
      };
      const exists = await usersModel.findUnique({ email: newUser.email });
      if (exists) {
        return;
      }
      const createdUser = await usersModel.create(newUser);
      if (!createdUser) {
        throw new Error("Couldn't create the user");
      }
      user2 = createdUser;
      user2Token = jwt.sign(user2, jwt_secret);
    });
    afterAll(async () => {
      await usersModel.deleteMany({ email: "user2@test.com" });
    });
    it("should return 401 Unauthorized (no auth token)", async () => {
      // Act-assert
      await request(app)
        .delete(`/users/${user2.id}`)
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
      await request(app)
        .delete(`/users/${user2.id}`)
        .set("authorization", `Bearer ${userToken}`)
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
        .delete(`/users/-1`)
        .set("authorization", `Bearer ${user2Token}`)
        .expect(400)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("must be a positive integer");
        });
    });
    it("should return 404 Not Found (bad id)", async () => {
      // Act-assert
      await request(app)
        .delete(`/users/${user2.id + 1}`)
        .set("authorization", `Bearer ${user2Token}`)
        .expect(404)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("fail");
          expect(res.body.data.userId).toBe("not found");
        });
    });
    it("should return 200 OK", async () => {
      await request(app)
        .delete(`/users/${user2.id}`)
        .set("authorization", `Bearer ${user2Token}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.status).toBe("success");
          expect(res.body.data.email).toBe(user2.email);
        });
    });
  });
});
