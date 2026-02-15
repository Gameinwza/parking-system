import { Elysia, t } from "elysia";
import { register, login } from "../services/auth.service";

export const authRoutes = new Elysia({ prefix: "/auth" })

  .post(
    "/register",
    async ({ body, set }) => {
      try {
        return await register(body);
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 })
      })
    }
  )

  .post(
    "/login",
    async ({ body, set }) => {
      try {
        return await login(body.email, body.password);
      } catch (error: any) {
        set.status = 400;
        return { error: "Invalid email or password" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String()
      })
    }
  );