import { pool } from "../config/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

interface Vehicle extends RowDataPacket {
  id: number;
  user_id: number;
  plate_number: string;
}
export const getVehiclesByUserService = async (userId: number) => {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles WHERE user_id = ?",
    [userId]
  );

  return rows;
};
/* =========================
   CREATE
========================= */
export const createVehicleService = async (

  userId: number,
  plateNumber: string
) => {
    console.log(userId);
  if (!plateNumber) {
    throw new Error("Plate number is required");
  }

  // เช็ค plate ซ้ำ
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM vehicles WHERE plate_number = ?",
    [plateNumber]
  );

  if (existing.length > 0) {
    throw new Error("Plate number already exists");
  }

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO vehicles (user_id, plate_number) VALUES (?, ?)",
    [userId, plateNumber]
  );

  return {
    message: "Vehicle created",
    vehicleId: result.insertId
  };
};

/* =========================
   GET ALL (ของตัวเอง)
========================= */
export const getMyVehiclesService = async (userId: number) => {
  const [rows] = await pool.query<Vehicle[]>(
    "SELECT * FROM vehicles WHERE user_id = ? ORDER BY id DESC",
    [userId]
  );

  return rows;
};

/* =========================
   GET BY ID (เช็ค owner)
========================= */
export const getVehicleByIdService = async (
  vehicleId: number,
  userId: number
) => {
  const [rows] = await pool.query<Vehicle[]>(
    "SELECT * FROM vehicles WHERE id = ? AND user_id = ?",
    [vehicleId, userId]
  );

  if (rows.length === 0) {
    throw new Error("Vehicle not found or not yours");
  }

  return rows[0];
};

/* =========================
   UPDATE (เช็ค owner)
========================= */
export const updateVehicleService = async (
  vehicleId: number,
  plateNumber: string,
  userId: number
) => {
  if (!plateNumber) {
    throw new Error("Plate number is required");
  }

  // เช็ค plate ซ้ำ (ยกเว้นคันตัวเอง)
  const [duplicate] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM vehicles WHERE plate_number = ? AND id != ?",
    [plateNumber, vehicleId]
  );

  if (duplicate.length > 0) {
    throw new Error("Plate number already exists");
  }

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE vehicles
     SET plate_number = ?
     WHERE id = ? AND user_id = ?`,
    [plateNumber, vehicleId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Vehicle not found or not yours");
  }

  return { message: "Vehicle updated" };
};

/* =========================
   DELETE (เช็ค owner)
========================= */
export const deleteVehicleService = async (
  vehicleId: number,
  userId: number
) => {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM vehicles WHERE id = ? AND user_id = ?",
    [vehicleId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Vehicle not found or not yours");
  }

  return { message: "Vehicle deleted" };
};