import { handler } from "../../src/index";
import prisma from "../../src/prisma/client";

const req = (path: string, options?: RequestInit) =>
  new Request(`http://localhost:3000${path}`, options);

afterAll(async () => {
  await prisma.$disconnect();
});

let orderItemId: string;
let userId: string;
let accessToken: string;
let orderId: number;
let productId: number;

describe("OrderItem API", () => {
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

    const orderResponse = await prisma.order.create({
      data: {
        userId: userId,
        status: "PENDING",
        totalAmount: 100.0,
      },
    });
    orderId = orderResponse.id;

    const productResponse = await prisma.product.create({
      data: {
        name: "Test Product",
        description: "This is a test product",
        price: 50.0,
        stock: 20,
      },
    });
    productId = productResponse.id;
  });

  describe("Create Order Item", () => {
    it("should create a new order item with valid data (admin only)", async () => {
      const response = await handler(
        req("/api/v1/order-items", {
          method: "POST",
          body: JSON.stringify({
            orderId: orderId,
            productId: productId,
            quantity: 2,
            price: 50.0,
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        })
      );

      expect(response.status).toBe(201);
      const result = await response.json();
      orderItemId = result.data.id;
      expect(result).toMatchObject({
        success: true,
        message: "Order item created successfully",
      });
    });
  });

  describe("Get Order Item by ID", () => {
    it("should get a single order item by ID", async () => {
      const response = await handler(
        req(`/api/v1/order-items/${orderItemId}`, {
          method: "GET",
          headers: { authorization: `Bearer ${accessToken}` },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("quantity");
      expect(result.data).toHaveProperty("price");
    });
  });

  describe("Update Order Item", () => {
    it("should update an order item by ID (admin only)", async () => {
      const response = await handler(
        req(`/api/v1/order-items/${orderItemId}`, {
          method: "PUT",
          body: JSON.stringify({
            quantity: 3,
            price: 45.0,
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
        message: "Order item updated successfully",
      });
    });
  });

  describe("Delete Order Item", () => {
    it("should delete an order item by ID (admin only)", async () => {
      const response = await handler(
        req(`/api/v1/order-items/${orderItemId}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${accessToken}` },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toMatchObject({
        success: true,
        message: "Order item deleted successfully",
      });
    });
  });

  afterAll(async () => {
    await prisma.order.delete({ where: { id: orderId } });
    await prisma.product.delete({ where: { id: productId } });

    const deleteResponse = await handler(
      req(`/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${accessToken}` },
      })
    );
    expect(deleteResponse.status).toBe(200);
  });
});
