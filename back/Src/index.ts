import { Elysia } from "elysia";
import { reservationRoutes } from "./routes/reservation.route";
import { paymentRoutes } from "./routes/payment.route";
import { vehicleRoutes } from "./routes/vehicle.route";
import { adminRoutes } from "./routes/admin.route";
import { authRoutes } from "./routes/auth.route";
import cors from "@elysiajs/cors";
import { userRoutes } from "./routes/user.route";

const app = new Elysia();

app.use(reservationRoutes);
app.use(paymentRoutes);
app.use(vehicleRoutes);
app.use(adminRoutes);
app.use(authRoutes);
app.use(userRoutes);

// app.get("/ping", () => "pong");


app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    })
)
app.listen(3000);
console.log("Server running on http://localhost:3000");
