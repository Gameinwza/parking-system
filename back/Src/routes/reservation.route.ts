import { Elysia, t } from "elysia";
import { pool } from "../config/db";
import {
  createReservationService,
  getMyReservationsService,
  cancelReservationService,
  expireReservationsService
} from "../services/reservation.service";
import { authMiddleware } from "../middleware/auth.middleware";

export const reservationRoutes = new Elysia({ prefix: "/reservations" })
  .use(authMiddleware)

  // =========================
  // CREATE RESERVATION
  // =========================
  .post(
    "/",
    async ({ body, user, set }) => {
      try {
        return await createReservationService(
          user.id,
          body.vehicle_id,
          body.spot_id,
          body.start_time,
          body.end_time
        );
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        vehicle_id: t.Number(),
        spot_id: t.Number(),
        start_time: t.String(),
        end_time: t.String()
      })
    }
  )

  // =========================
  // GET MY RESERVATIONS
  // =========================
  .get("/my", async ({ user }) => {
    return await getMyReservationsService(user.id);
  })

  // =========================
  // CANCEL RESERVATION (Soft Delete)
  // =========================
  .patch("/:id/cancel", async ({ params, user, set }) => {
    try {
      return await cancelReservationService(
        Number(params.id),
        user.id
      );
    } catch (error: any) {
      set.status = 400;
      return { error: error.message };
    }
  })

  // =========================
  // EXPIRE OLD RESERVATIONS
  // =========================
  .post("/expire", async () => {
    return await expireReservationsService();
  })

  // =========================
  // GET FLOORS
  // =========================
  .get("/floors", async () => {
    const [rows] = await pool.query(
      "SELECT DISTINCT floor FROM parking_spots ORDER BY floor ASC"
    );
    return rows;
  })

  // =========================
  // GET SPOTS BY FLOOR
  // =========================
  .get("/floor/:floor", async ({ params }) => {
    const [rows] = await pool.query(
      "SELECT * FROM parking_spots WHERE floor = ? ORDER BY spot_number ASC",
      [params.floor]
    );
    return rows;
  });