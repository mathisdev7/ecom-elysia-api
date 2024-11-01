import { Elysia } from "elysia";
import { error, logger } from "./middlewares";
import { userRoutes } from "./routes";

const app = new Elysia();

app.use(logger());
app.use(error());

app.get("/", () => "Hello, world!");

export const handler = app.fetch;

app.use(userRoutes);

app.listen(3000);

console.log(
  `🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
