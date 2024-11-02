import { handler } from "../../src/index";
import prisma from "../../src/prisma/client";

const req = (path: string, options?: RequestInit) =>
  new Request(`http://localhost:3000${path}`, options);

afterAll(async () => {
  await prisma.$disconnect();
});

let userId: string;
let accessToken: string;

describe("User API", () => {
  describe("User Registration", () => {
    it("should register a new user with valid data", async () => {
      const response = await handler(
        req("/api/v1/users", {
          method: "POST",
          body: JSON.stringify({
            name: "Test User",
            username: "testuser",
            email: "test@example.com",
            password: "securePassword123",
            isAdmin: true,
          }),
          headers: { "Content-Type": "application/json" },
        })
      );

      expect(response.status).toBe(201);
      const result = await response.json();
      userId = result.data.id;
      expect(result).toMatchObject({
        success: true,
        message: "User created successfully",
      });
    });

    it("should return error for existing user", async () => {
      const response = await handler(
        req("/api/v1/users", {
          method: "POST",
          body: JSON.stringify({
            name: "Test User",
            username: "testuser",
            email: "test@example.com",
            password: "securePassword123",
            isAdmin: false,
          }),
          headers: { "Content-Type": "application/json" },
        })
      );

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result).toMatchObject({
        status: 400,
        success: false,
        message: "User already exists!",
      });
    });
  });

  describe("User Login", () => {
    it("should login a user with valid credentials", async () => {
      const response = await handler(
        req("/api/v1/users/login", {
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "securePassword123",
          }),
          headers: { "Content-Type": "application/json" },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toMatchObject({
        success: true,
        message: "User logged in successfully",
      });
      accessToken = result.data.accessToken;
      expect(result.data).toHaveProperty("accessToken");
    });
  });

  describe("Get Users", () => {
    it("should get all users (admin only)", async () => {
      const response = await handler(
        req("/api/v1/users", {
          method: "GET",
          headers: { authorization: `Bearer ${accessToken}` },
        })
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("Get User Profile", () => {
    it("should get profile of the logged-in user", async () => {
      const response = await handler(
        req("/api/v1/users/profile", {
          method: "GET",
          headers: { authorization: `Bearer ${accessToken}` },
        })
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("name");
    });
  });

  describe("Get User by ID", () => {
    it("should get a single user by ID", async () => {
      const response = await handler(
        req(`/api/v1/users/${userId}`, {
          method: "GET",
          headers: { authorization: `Bearer ${accessToken}` },
        })
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("name");
    });
  });

  describe("Update User", () => {
    it("should update a user (admin only)", async () => {
      const response = await handler(
        req(`/api/v1/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: "Updated User",
            email: "updated@example.com",
            password: "newSecurePassword123",
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toMatchObject({
        success: true,
        message: "User updated successfully",
      });
    });
  });

  describe("Delete User", () => {
    it("should delete a user by ID (admin only)", async () => {
      const response = await handler(
        req(`/api/v1/users/${userId}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${accessToken}` },
        })
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toMatchObject({
        success: true,
        message: "User deleted successfully",
      });
    });
  });
});
