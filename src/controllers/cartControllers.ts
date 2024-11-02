import { Context } from "elysia";
import prisma from "../prisma/client";

/**
 * @api [POST] /cart-items
 * @description: Create a new cart item
 * @action public
 */
export const createCartItem = async (c: Context) => {
  if (!c.body) throw new Error("No body provided");

  const { cartId, productId, quantity } = c.body as {
    cartId: number;
    productId: number;
    quantity: number;
  };

  try {
    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      c.set.status = 404;
      throw new Error("Cart not found");
    }

    const cartItem = await prisma.cartItem.create({
      data: { cartId, productId, quantity },
    });

    c.set.status = 201;
    return {
      status: c.set.status,
      success: true,
      data: cartItem,
      message: "Cart item created successfully",
    };
  } catch (error: any) {
    console.log(error);
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error creating cart item",
      error: error.message,
    };
  }
};

/**
 * @api [GET] /cart-items/:cartId
 * @description: Get all cart items for a specific cart
 * @action public
 */
export const getCartItems = async (
  c: Context<{ params: { cartId: string } }>
) => {
  const { cartId } = c.params;

  if (!cartId) {
    c.set.status = 400;
    throw new Error("No cart ID provided");
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: parseInt(cartId) },
      include: { Product: true },
    });

    return {
      status: 200,
      success: true,
      data: cartItems,
      message: "Cart items fetched successfully",
    };
  } catch (error: any) {
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error retrieving cart items",
      error: error.message,
    };
  }
};

/**
 * @api [PUT] /cart-items/:id
 * @description: Update a cart item
 * @action admin
 */
export const updateCartItem = async (
  c: Context<{ params: { id: string } }>
) => {
  const { id } = c.params;

  if (!id) {
    c.set.status = 400;
    throw new Error("No cart item ID provided");
  }

  if (!c.body) throw new Error("No body provided");

  const { quantity } = c.body as {
    quantity?: number;
  };

  try {
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity },
    });

    return {
      status: 200,
      success: true,
      data: updatedCartItem,
      message: "Cart item updated successfully",
    };
  } catch (error: any) {
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error updating cart item",
      error: error.message,
    };
  }
};

/**
 * @api [DELETE] /cart-items/:id
 * @description: Delete a cart item
 * @action admin
 */
export const deleteCartItem = async (
  c: Context<{ params: { id: string } }>
) => {
  const { id } = c.params;

  if (!id) {
    c.set.status = 400;
    throw new Error("No cart item ID provided");
  }

  try {
    await prisma.cartItem.delete({
      where: { id: parseInt(id) },
    });

    return {
      status: 200,
      success: true,
      message: "Cart item deleted successfully",
    };
  } catch (error: any) {
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error deleting cart item",
      error: error.message,
    };
  }
};
