import { Elysia, t } from "elysia";
import {
  createOrderItem,
  deleteOrderItem,
  getOrderItem,
  updateOrderItem,
} from "../controllers";
import { admin, auth } from "../middlewares";

const orderItemRoutes = (app: Elysia) => {
  app.group("/api/v1/order-items", (app) =>
    app
      .post("/", createOrderItem, {
        beforeHandle: (c) => admin(c),
        body: t.Object({
          orderId: t.Number(),
          productId: t.Number(),
          quantity: t.Number(),
          price: t.Number(),
        }),
        type: "json",
      })
      .get("/:id", getOrderItem, { beforeHandle: (c) => auth(c) })
      .put("/:id", updateOrderItem, { beforeHandle: (c) => admin(c) })
      .delete("/:id", deleteOrderItem, { beforeHandle: (c) => admin(c) })
  );
};

export default orderItemRoutes as any;
