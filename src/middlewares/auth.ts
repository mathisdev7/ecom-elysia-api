import { Context } from "elysia";
import prisma from "../prisma/client";
import { jwt } from "../utils";

/**
 * @name auth
 * @description Middleware to protect routes with JWT
 */
export const auth = async (c: Context) => {
  let token;

  if (c.headers.authorization && c.headers.authorization.startsWith("Bearer")) {
    try {
      token = c.headers.authorization.split(" ")[1];
      const decoded = await jwt.verify(token);

      if (!decoded.id) {
        c.set.status = 401;
        throw new Error("Not authorized, No userId found!");
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id as string },
      });

      if (!user) {
        c.set.status = 401;
        throw new Error("Not authorized, User not found!");
      }

      c.request.headers.set("userId", user.id.toString());
    } catch (error) {
      c.set.status = 401;
      throw new Error("Not authorized, Invalid token!");
    }
  }
  if (!token) {
    c.set.status = 401;
    throw new Error("Not authorized, No token found!");
  }
};

/**
 * @name admin
 * @description Middleware to protect routes with JWT and restrict access to admin users only
 */
export const admin = async (c: Context) => {
  await auth(c);

  const userId = c.request.headers.get("userId");
  if (!userId) {
    c.set.status = 401;
    throw new Error("Not authorized, No userId found!");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    c.set.status = 401;
    throw new Error("Not authorized, Admin access only!");
  }
};
