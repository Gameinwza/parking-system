import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

import {
  getRevenueService,
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  createParkingSpotService
} from "../services/admin.service";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(authMiddleware)
  .use(adminMiddleware)

  .get("/revenue", async () => {
    return await getRevenueService();
  })

  .get("/users", async () => {
    return await getAllUsersService();
  })

  .get(
    "/users/:id",
    async ({ params, set }) => {
      try {
        return await getUserByIdService(Number(params.id));
      } catch (error: any) {
        set.status = 404;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.String()
      })
    }
  )

  .post(
    "/users",
    async ({ body }) => {
      return await createUserService(
        body.name,
        body.email,
        body.password,
        body.role
      );
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
        role: t.String()
      })
    }
  )

  .put(
    "/users/:id",
    async ({ params, body, set }) => {
      try {
        return await updateUserService(
          Number(params.id),
          body.name,
          body.email,
          body.role
        );
      } catch (error: any) {
        set.status = 404;
        return { error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.String(),
        email: t.String(),
        role: t.String()
      })
    }
  )

  .delete(
  "/users/:id",
  async ({ params, store, set }: any) => {
    const id = Number(params.id);

    if (isNaN(id) || id <= 0) {
      set.status = 400;
      return { error: "Invalid user ID" };
    }

    // 👇 cast store ให้ TS รู้ว่ามี user
    const currentUser = (store as {
      user: { id: number; role: string };
    }).user;

    if (currentUser.id === id) {
      set.status = 403;
      return { error: "Cannot delete yourself" };
    }

    try {
      return await deleteUserService(currentUser.id, id);
    } catch (error: any) {
      if (
        error.message === "Cannot delete yourself" ||
        error.message === "Cannot delete admin users"
      ) {
        set.status = 403;
      } else if (error.message === "User not found") {
        set.status = 404;
      } else {
        set.status = 500;
      }

      return { error: error.message };
    }
  },
  {
    params: t.Object({
      id: t.String()
    })
  }
)

.post(
  "/spots",
  async ({ body }) => {
    return await createParkingSpotService(
      body.spotNumber,
      body.floor
    );
  },
  {
    body: t.Object({
      spotNumber: t.String(),
      floor: t.Number()
    })
  }
)