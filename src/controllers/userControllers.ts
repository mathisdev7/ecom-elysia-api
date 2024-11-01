import { Context } from "elysia";
import prisma from "../prisma/client";
import { jwt } from "../utils";

/**
 * @api [POST] /users
 * @description: Create a new user
 * @action public
 */
export const createUser = async (c: Context) => {
  if (!c.body) throw new Error("No body provided");

  const { name, email, password, isAdmin, username } = c.body as RegBody;
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    c.set.status = 400;
    return {
      status: c.set.status,
      success: false,
      message: "User already exists!",
    };
  }

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 4, // number between 4-31
  });

  const _user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      password: hashedPassword,
      role: isAdmin ? "ADMIN" : "USER",
    },
  });

  const accessToken = await jwt.sign({
    data: { id: _user.id },
  });

  c.set.status = 201;
  return {
    status: c.set.status,
    success: true,
    data: { accessToken, id: _user.id },
    message: "User created successfully",
  };
};

/**
 * @api [POST] /users/login
 * @description: Login a user
 * @action public
 */
export const loginUser = async (c: Context) => {
  if (!c.body) throw new Error("No body provided");

  const { email, password } = c.body as LoginBody;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    c.set.status = 401;
    throw new Error("User not found!");
  }

  const isPasswordValid = await Bun.password.verify(password, user?.password);
  if (!isPasswordValid) {
    c.set.status = 401;
    throw new Error("Invalid email or password!");
  }

  const accessToken = await jwt.sign({
    data: { id: user.id },
  });

  return {
    status: c.set.status,
    success: true,
    data: { accessToken },
    message: "User logged in successfully",
  };
};

/**
 * @api [GET] /users
 * @description: Get all users
 * @action admin
 */
export const getUsers = async (c: Context) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        password: false,
        id: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
      },
    });

    if (!users || users.length === 0) {
      c.set.status = 404;
      throw new Error("No users found!");
    }

    return {
      status: 200,
      success: true,
      data: users,
      message: "Users fetched successfully",
    };
  } catch (error) {
    c.set.status = 500;
    console.log(error);
  }
};

/**
 * @api [GET] /users/:id
 * @description: Get a single user
 * @action admin
 */
export const getUser = async (c: Context<{ params: { id: string } }>) => {
  if (!c.params?.id) {
    c.set.status = 400;
    throw new Error("No id provided");
  }

  const user = await prisma.user.findUnique({
    where: { id: c.params.id },
    select: {
      password: false,
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    c.set.status = 404;
    throw new Error("User not found!");
  }

  return {
    status: c.set.status,
    success: true,
    data: user,
    message: "User fetched successfully",
  };
};

/**
 * @api [GET] /users/profile
 * @description: Get user profile
 * @action private
 */
export const getUserProfile = async (c: Context) => {
  let token, userId;
  if (c.headers.authorization && c.headers.authorization.startsWith("Bearer")) {
    token = c.headers.authorization.split(" ")[1];
    const decoded = await jwt.verify(token);
    userId = decoded.id;
  }

  if (!userId) {
    c.set.status = 401;
    throw new Error("Not authorized, No userId found!");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    select: {
      password: false,
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    c.set.status = 404;
    throw new Error("User not found!");
  }

  return {
    status: 200,
    success: true,
    data: user,
    message: "Profile fetched successfully",
  };
};

/**
 * @api [PUT] /users/:id
 * @description: Update a single user
 * @action public
 */
export const updateUser = async (c: Context<{ params: { id: string } }>) => {
  if (!c.params?.id) {
    c.set.status = 400;
    throw new Error("No id provided");
  }

  if (!c.body) throw new Error("No body provided");

  const { name, email, password } = c.body as UpdateBody;

  if (!password) {
    c.set.status = 400;
    throw new Error("No password provided");
  }

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 4, // number between 4-31
  });

  const updatedUser = await prisma.user.update({
    where: { id: c.params.id },
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  if (!updatedUser) {
    c.set.status = 400;
    throw new Error("Invalid user data!");
  }

  return {
    status: 200,
    success: true,
    data: updatedUser,
    message: "User updated successfully",
  };
};

/**
 * @api [DELETE] /users/:id
 * @description: Delete a single user
 * @action public
 */
export const deleteUser = async (c: Context<{ params: { id: string } }>) => {
  if (!c.params?.id) {
    c.set.status = 400;
    throw new Error("No id provided");
  }

  await prisma.user.delete({
    where: { id: c.params.id },
  });

  return {
    status: c.set.status,
    success: true,
    message: "User deleted successfully",
  };
};
