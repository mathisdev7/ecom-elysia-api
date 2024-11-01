import { Elysia, t } from "elysia";
import {
  createUser,
  deleteUser,
  getUser,
  getUserProfile,
  getUsers,
  loginUser,
  updateUser,
} from "../controllers";
import { admin, auth } from "../middlewares";

const userRoutes = (app: Elysia) => {
  app.group("/api/v1/users", (app) =>
    app
      .post("/", createUser, {
        body: t.Object({
          username: t.String(),
          name: t.String(),
          email: t.String(),
          password: t.String(),
          isAdmin: t.Optional(t.Boolean()),
        }),
        type: "json",
      })

      .post("/login", loginUser, {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
        type: "json",
      })

      .get("/", getUsers, {
        beforeHandle: (c) => admin(c),
      })

      .get("/:id", getUser, {
        beforeHandle: (c) => auth(c),
      })

      .get("/profile", getUserProfile, {
        beforeHandle: (c) => auth(c),
      })

      .put("/:id", updateUser, {
        beforeHandle: (c) => admin(c),
      })

      .delete("/:id", deleteUser, {
        beforeHandle: (c) => admin(c),
      })
  );
};

export default userRoutes as any;
