import { Elysia, t } from "elysia";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers";
import { admin } from "../middlewares";

const productRoutes = (app: Elysia) => {
  app.group("/api/v1/products", (app) =>
    app
      .post("/", createProduct, {
        body: t.Object({
          name: t.String(),
          description: t.String(),
          price: t.Number(),
          stock: t.Number(),
          category: t.String(),
        }),
        type: "json",
        beforeHandle: (c) => admin(c),
      })

      .get("/", getProducts)

      .get("/:id", getProduct)

      .put("/:id", updateProduct, {
        body: t.Object({
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          price: t.Optional(t.Number()),
          stock: t.Optional(t.Number()),
          category: t.Optional(t.String()),
        }),
        type: "json",
        beforeHandle: (c) => admin(c),
      })

      .delete("/:id", deleteProduct, {
        beforeHandle: (c) => admin(c),
      })
  );
};

export default productRoutes as any;
