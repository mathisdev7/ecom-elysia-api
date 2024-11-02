import { handler } from "../../src/index";
import prisma from "../../src/prisma/client";

const req = (path: string, options?: RequestInit) =>
  new Request(`http://localhost:3000${path}`, options);

afterAll(async () => {
  await prisma.$disconnect();
});

let productId: string;
let userId: string;
let accessToken: string;

describe("Product API", () => {
  beforeAll(async () => {
    const registerResponse = await handler(
      req("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({
          name: "Admin User",
          username: "adminuser",
          email: "admin@example.com",
          password: "adminPassword123",
          isAdmin: true,
        }),
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(registerResponse.status).toBe(201);
    const registerResult = await registerResponse.json();
    userId = registerResult.data.id;

    const loginResponse = await handler(
      req("/api/v1/users/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "adminPassword123",
        }),
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(loginResponse.status).toBe(200);
    const loginResult = await loginResponse.json();
    accessToken = loginResult.data.accessToken;
  });
  describe("Create Product", () => {
    it("should create a new product with valid data (admin only)", async () => {
      const response = await handler(
        req("/api/v1/products", {
          method: "POST",
          body: JSON.stringify({
            name: "Test Product",
            description: "This is a test product",
            price: 99.99,
            stock: 10,
            category: "Electronics",
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        })
      );

      expect(response.status).toBe(201);
      const result = await response.json();
      productId = result.data.id;
      expect(result).toMatchObject({
        success: true,
        message: "Product created successfully",
      });
    });
  });

  describe("Get All Products", () => {
    it("should get all products", async () => {
      const response = await handler(
        req("/api/v1/products", { method: "GET" })
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("Get Product by ID", () => {
    it("should get a single product by ID", async () => {
      const response = await handler(
        req(`/api/v1/products/${productId}`, { method: "GET" })
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("name");
    });
  });

  describe("Update Product", () => {
    it("should update a product by ID (admin only)", async () => {
      const response = await handler(
        req(`/api/v1/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: "Updated Product",
            description: "This is an updated test product",
            price: 79.99,
            stock: 15,
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
        message: "Product updated successfully",
      });
    });
  });

  describe("Delete Product", () => {
    it("should delete a product by ID (admin only)", async () => {
      const response = await handler(
        req(`/api/v1/products/${productId}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${accessToken}` },
        })
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toMatchObject({
        success: true,
        message: "Product deleted successfully",
      });
    });
  });
  afterAll(async () => {
    const deleteResponse = await handler(
      req(`/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${accessToken}` },
      })
    );
    expect(deleteResponse.status).toBe(200);
  });
});
