import { Elysia } from "elysia";
import { error, logger } from "./middlewares";
import { productRoutes, userRoutes } from "./routes";
import cartRoutes from "./routes/cartRoutes";
import orderItemRoutes from "./routes/orderItemRoutes";

const app = new Elysia();

app.use(logger());
app.use(error());

app.get("/", () => "Hello, world!");

export const handler = app.fetch;

app.use(userRoutes);
app.use(productRoutes);
app.use(orderItemRoutes);
app.use(cartRoutes);

app.listen(3000);

console.log(
  `🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
