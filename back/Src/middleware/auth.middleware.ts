import { Elysia } from "elysia";
import { verifyToken } from "../services/auth.service";

export const authMiddleware = (app: Elysia) =>
  app
    .decorate("user", { id: 0, role: "" })
    .onBeforeHandle(({ headers, set, user }) => {
      console.log("🔥 AUTH HIT");

      const authHeader = headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        throw new Error("Invalid token");
      }

      const token = authHeader.split(" ")[1]!;
      const decoded = verifyToken(token);

      Object.assign(user, decoded);
    });