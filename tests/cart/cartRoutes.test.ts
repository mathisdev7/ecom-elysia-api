import { handler } from "../../src/index";
import prisma from "../../src/prisma/client";

const req = (path: string, options?: RequestInit) =>
  new Request(`http://localhost:3000${path}`, options);

afterAll(async () => {
  await prisma.$disconnect();
});

let cartId: number;
let userId: string;
let accessToken: string;
let productId: number;

describe("CartItem API", () => {
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

    const productResponse = await prisma.product.create({
      data: {
        name: "Test Product",
        description: "This is a test product",
        price: 50.0,
        stock: 20,
      },
    });
    productId = productResponse.id;

    const cartResponse = await prisma.cart.create({
      data: {
        userId: userId,
      },
    });
    cartId = cartResponse.id;
  });

  describe("Create Cart Item", () => {
    it("should create a new cart item with valid data", async () => {
      const response = await handler(
        req("/api/v1/cart", {
          method: "POST",
          body: JSON.stringify({
            cartId: cartId,
            productId: productId,
            quantity: 2,
          }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        })
      );

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result).toMatchObject({
        success: true,
        message: "Cart item created successfully",
      });
    });
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany({ where: { cartId: cartId } });
    await prisma.product.delete({ where: { id: productId } });
    await prisma.cart.delete({ where: { id: cartId } });

    const deleteResponse = await handler(
      req(`/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${accessToken}` },
      })
    );
    expect(deleteResponse.status).toBe(200);
  });
});
