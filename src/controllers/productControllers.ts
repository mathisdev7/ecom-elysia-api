import { Context } from "elysia";
import prisma from "../prisma/client";

/**
 * @api [POST] /products
 * @description: Create a new product
 * @action admin
 */
export const createProduct = async (c: Context) => {
  if (!c.body) throw new Error("No body provided");

  const { name, description, price, stock } = c.body as {
    name: string;
    description?: string;
    price: number;
    stock: number;
  };

  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
    },
  });

  c.set.status = 201;
  return {
    status: c.set.status,
    success: true,
    data: newProduct,
    message: "Product created successfully",
  };
};

/**
 * @api [GET] /products
 * @description: Get all products
 * @action public
 */
export const getProducts = async (c: Context) => {
  const products = await prisma.product.findMany();

  if (!products || products.length === 0) {
    c.set.status = 404;
    throw new Error("No products found!");
  }

  return {
    status: 200,
    success: true,
    data: products,
    message: "Products fetched successfully",
  };
};

/**
 * @api [GET] /products/:id
 * @description: Get a single product
 * @action public
 */
export const getProduct = async (c: Context<{ params: { id: string } }>) => {
  const { id } = c.params;

  if (!id) {
    c.set.status = 400;
    throw new Error("No product ID provided");
  }

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    c.set.status = 404;
    throw new Error("Product not found!");
  }

  return {
    status: 200,
    success: true,
    data: product,
    message: "Product fetched successfully",
  };
};

/**
 * @api [PUT] /products/:id
 * @description: Update a product
 * @action admin
 */
export const updateProduct = async (c: Context<{ params: { id: string } }>) => {
  const { id } = c.params;
  if (!id) {
    c.set.status = 400;
    throw new Error("No product ID provided");
  }

  if (!c.body) throw new Error("No body provided");

  const { name, description, price, stock } = c.body as {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
  };

  const updatedProduct = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      name,
      description,
      price,
      stock,
    },
  });

  return {
    status: 200,
    success: true,
    data: updatedProduct,
    message: "Product updated successfully",
  };
};

/**
 * @api [DELETE] /products/:id
 * @description: Delete a product
 * @action admin
 */
export const deleteProduct = async (c: Context<{ params: { id: string } }>) => {
  const { id } = c.params;
  if (!id) {
    c.set.status = 400;
    throw new Error("No product ID provided");
  }

  await prisma.product.delete({
    where: { id: parseInt(id) },
  });

  return {
    status: 200,
    success: true,
    message: "Product deleted successfully",
  };
};
