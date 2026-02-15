import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getMyProfileService,
  getMyDashboardService
} from "../services/user.service";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authMiddleware)

  // =========================
  // GET MY PROFILE
  // =========================
  .get("/me", async ({ user }) => {
    return await getMyProfileService(user.id);
  })

  // =========================
  // GET USER DASHBOARD SUMMARY
  // =========================
  .get("/dashboard", async ({ user }) => {
    return await getMyDashboardService(user.id);
  });