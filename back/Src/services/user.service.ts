import { pool } from "../config/db";
import type { RowDataPacket } from "mysql2";

interface DashboardSummary extends RowDataPacket {
  name: string;
  email: string;
  total_paid: number;
  total_vehicles: number;
  active_reservations: number;
}

// =========================
// GET USER PROFILE
// =========================
export const getMyProfileService = async (userId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [userId]
  );

  return rows[0];
};

// =========================
// GET USER DASHBOARD SUMMARY
// =========================
export const getMyDashboardService = async (userId: number) => {
  const [rows] = await pool.query<DashboardSummary[]>(
    `
    SELECT 
      u.name,
      u.email,
      u.role,
      IFNULL(SUM(r.amount), 0) AS total_paid,
      (SELECT COUNT(*) FROM vehicles v WHERE v.user_id = u.id) AS total_vehicles,
      (SELECT COUNT(*) FROM reservations r2 
        WHERE r2.user_id = u.id 
        AND r2.status IN ('pending','paid')
      ) AS active_reservations
    FROM users u
    LEFT JOIN reservations r ON r.user_id = u.id 
      AND r.status = 'completed'
    WHERE u.id = ?
    GROUP BY u.id
    `,
    [userId]
  );

  if (!rows[0]) {
    throw new Error("User not found");
  }

  return rows[0];
};