import { Elysia } from "elysia";

export const adminMiddleware = new Elysia({ name: "admin" }).onBeforeHandle(
  ({ store, set }: any) => {
    if (!store.user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    if (store.user.role !== "admin") {
      set.status = 403;
      return { error: "Admin access required" };
    }
  }
);