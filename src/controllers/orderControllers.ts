import { Context } from "elysia";
import prisma from "../prisma/client";

/**
 * @api [POST] /order-items
 * @description: Create a new order item
 * @action admin
 */
export const createOrderItem = async (c: Context) => {
  if (!c.body) throw new Error("No body provided");

  const { orderId, productId, quantity, price } = c.body as {
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
  };

  try {
    const orderItem = await prisma.orderItem.create({
      data: { orderId, productId, quantity, price },
    });

    c.set.status = 201;
    return {
      status: c.set.status,
      success: true,
      data: orderItem,
      message: "Order item created successfully",
    };
  } catch (error: any) {
    console.log(error);
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error creating order item",
      error: error.message,
    };
  }
};

/**
 * @api [GET] /order-items/:id
 * @description: Get a single order item
 * @action public
 */
export const getOrderItem = async (c: Context<{ params: { id: string } }>) => {
  const { id } = c.params;

  if (!id) {
    c.set.status = 400;
    throw new Error("No order item ID provided");
  }

  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!orderItem) {
      c.set.status = 404;
      throw new Error("Order item not found");
    }

    return {
      status: 200,
      success: true,
      data: orderItem,
      message: "Order item fetched successfully",
    };
  } catch (error: any) {
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error retrieving order item",
      error: error.message,
    };
  }
};

/**
 * @api [PUT] /order-items/:id
 * @description: Update an order item
 * @action admin
 */
export const updateOrderItem = async (
  c: Context<{ params: { id: string } }>
) => {
  const { id } = c.params;
  if (!id) {
    c.set.status = 400;
    throw new Error("No order item ID provided");
  }

  if (!c.body) throw new Error("No body provided");

  const { quantity, price } = c.body as {
    quantity?: number;
    price?: number;
  };

  try {
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: parseInt(id) },
      data: { quantity, price },
    });

    return {
      status: 200,
      success: true,
      data: updatedOrderItem,
      message: "Order item updated successfully",
    };
  } catch (error: any) {
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error updating order item",
      error: error.message,
    };
  }
};

/**
 * @api [DELETE] /order-items/:id
 * @description: Delete an order item
 * @action admin
 */
export const deleteOrderItem = async (
  c: Context<{ params: { id: string } }>
) => {
  const { id } = c.params;
  if (!id) {
    c.set.status = 400;
    throw new Error("No order item ID provided");
  }

  try {
    await prisma.orderItem.delete({
      where: { id: parseInt(id) },
    });

    return {
      status: 200,
      success: true,
      message: "Order item deleted successfully",
    };
  } catch (error: any) {
    c.set.status = 500;
    return {
      status: c.set.status,
      success: false,
      message: "Error deleting order item",
      error: error.message,
    };
  }
};
