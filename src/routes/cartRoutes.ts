import { Elysia, t } from "elysia";
import {
  createCartItem,
  deleteCartItem,
  getCartItems,
  updateCartItem,
} from "../controllers";
import { admin, auth } from "../middlewares";

const cartRoutes = (app: Elysia) => {
  app.group("/api/v1/cart", (app) =>
    app
      .post("/", createCartItem, {
        beforeHandle: (c) => auth(c),
        body: t.Object({
          cartId: t.Number(),
          productId: t.Number(),
          quantity: t.Number(),
        }),
        type: "json",
      })
      .get("/:cartId", getCartItems, { beforeHandle: (c) => auth(c) })
      .put("/:id", updateCartItem, { beforeHandle: (c) => admin(c) })
      .delete("/:id", deleteCartItem, { beforeHandle: (c) => admin(c) })
  );
};

export default cartRoutes as any;
