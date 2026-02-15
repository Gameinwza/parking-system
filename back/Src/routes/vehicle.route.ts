import { Elysia, t } from "elysia";
import {
  createVehicleService,
  getVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
  getVehiclesByUserService
} from "../services/vehicle.service";
import { authMiddleware } from "../middleware/auth.middleware";

export const vehicleRoutes = new Elysia({ prefix: "/vehicles" })
  .use(authMiddleware)
  .get("/", async ({ user }) => {
  return await getVehiclesByUserService(user.id);
})
  // =========================
  // Create
  // =========================
  // .get("/test", ()=>{
  //   console.log("hit v");
  //   return "ok";
  // })
  .post(
    "/",
    async ({ body, user, set }) => {
      try {
        // console.log(user);
        return await createVehicleService(
          user.id,
          body.plate_number
        );
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        plate_number: t.String()
      })
    }
  )

  // =========================
  // Get by ID
  // =========================
  .get("/:id", async ({ params, user, set }) => {
    try {
      return await getVehicleByIdService(
        Number(params.id),
        user.id
      );
    } catch (error: any) {
      set.status = 404;
      return { error: error.message };
    }
  })

  // =========================
  // Update
  // =========================
  .put(
    "/:id",
    async ({ params, body, user, set }) => {
      try {
        return await updateVehicleService(
          Number(params.id),
          body.plate_number,
          user.id
        );
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        plate_number: t.String()
      })
    }
  )

  // =========================
  // Delete
  // =========================
  .delete("/:id", async ({ params, user, set }) => {
    try {
      return await deleteVehicleService(
        Number(params.id),
        user.id
      );
    } catch (error: any) {
      set.status = 400;
      return { error: error.message };
    }
  });