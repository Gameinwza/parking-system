import { Elysia, t } from "elysia";
import { createPayment, verifyPayment } from "../services/payment.service";
import { authMiddleware } from "../middleware/auth.middleware";

export const paymentRoutes = new Elysia({ prefix: "/payments" })
  .use(authMiddleware)

  // Create Payment
  .post(
    "/",
    async ({ body, user, set }) => {
      try {
        return await createPayment(
          body.reservation_id,
          body.amount,
          user.id
        );
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        reservation_id: t.Number(),
        amount: t.Number()
      })
    }
  )

  // Verify Payment
  .post(
    "/verify/:id",
    async ({ params, user, set }) => {
      try {
        return await verifyPayment(
          Number(params.id),
          user.id
        );
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    }
  );