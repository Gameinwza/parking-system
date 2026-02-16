import { Elysia } from "elysia";
import { reservationRoutes } from "./routes/reservation.route";
import { paymentRoutes } from "./routes/payment.route";
import { vehicleRoutes } from "./routes/vehicle.route";
import { adminRoutes } from "./routes/admin.route";
import { authRoutes } from "./routes/auth.route";
import { userRoutes } from "./routes/user.route";
import cors from "@elysiajs/cors";
import { pool } from "./config/db";

const app = new Elysia();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

app.use(reservationRoutes);
app.use(paymentRoutes);
app.use(vehicleRoutes);
app.use(adminRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.get("/", () => "API WORKING");
app.get("/ping", () => "pong");

import { pool } from "./config/db";

app.get("/db-test", async () => {
  const [rows] = await pool.query("SELECT COUNT(*) as total FROM users");
  return rows;
});

const port = Number(process.env.PORT) || 3000;

app.listen(port);

console.log(`🚀 Server running on port ${port}`);
