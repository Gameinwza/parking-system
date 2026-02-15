import { pool } from "../config/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

/* =========================
   CREATE RESERVATION
========================= */
export const createReservationService = async (
  userId: number,
  vehicleId: number,
  slotId: number,
  startTime: string,
  endTime: string
) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ ตรวจสอบว่า vehicle เป็นของ user จริง
    const [vehicleRows]: any = await connection.query(
      "SELECT id FROM vehicles WHERE id = ? AND user_id = ?",
      [vehicleId, userId]
    );

    if (vehicleRows.length === 0) {
      throw new Error("Vehicle not found or not yours");
    }

    // 2️⃣ ตรวจสอบช่วงเวลา
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (!start || !end || end <= start) {
      throw new Error("Invalid time range");
    }

    // 3️⃣ ตรวจสอบ conflict
    const [conflicts]: any = await connection.query(
      `
      SELECT id FROM reservations
      WHERE slot_id = ?
      AND status IN ('pending','paid')
      AND (
        start_time < ?
        AND end_time > ?
      )
      `,
      [slotId, endTime, startTime]
    );

    if (conflicts.length > 0) {
      throw new Error("This parking slot is already reserved for this time range");
    }

    // 4️⃣ คำนวณราคา
    const hours = (end - start) / (1000 * 60 * 60);
    const ratePerHour = 50;
    const amount = Math.ceil(hours * ratePerHour);

    // 5️⃣ INSERT reservation
    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO reservations
      (user_id, vehicle_id, slot_id, start_time, end_time, amount, status, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 15 MINUTE))
      `,
      [userId, vehicleId, slotId, startTime, endTime, amount]
    );

    // 6️⃣ Update spot status
    await connection.query(
      "UPDATE parking_spots SET status = 'reserved' WHERE id = ?",
      [slotId]
    );

    await connection.commit();

    return {
      message: "Reservation created",
      reservationId: result.insertId,
      amount
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/* =========================
   GET MY RESERVATIONS
========================= */
export const getMyReservationsService = async (userId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      r.id,
      r.start_time,
      r.end_time,
      r.status,
      r.amount,
      ps.spot_number,
      ps.floor,
      v.plate_number
    FROM reservations r
    JOIN parking_spots ps ON r.slot_id = ps.id
    JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.user_id = ?
    ORDER BY r.start_time DESC
    `,
    [userId]
  );

  return rows;
};

/* =========================
   CANCEL RESERVATION
========================= */
export const cancelReservationService = async (
  reservationId: number,
  userId: number
) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.query(
      "SELECT user_id, status, slot_id FROM reservations WHERE id = ?",
      [reservationId]
    );

    if (rows.length === 0) {
      throw new Error("Reservation not found");
    }

    const reservation = rows[0];

    if (reservation.user_id !== userId) {
      throw new Error("Not authorized");
    }

    if (reservation.status !== "pending") {
      throw new Error("Cannot cancel this reservation");
    }

    // 1️⃣ Update reservation status
    await connection.query(
      "UPDATE reservations SET status = 'cancelled' WHERE id = ?",
      [reservationId]
    );

    // 2️⃣ Update spot back to available
    await connection.query(
      "UPDATE parking_spots SET status = 'available' WHERE id = ?",
      [reservation.slot_id]
    );

    await connection.commit();

    return { message: "Reservation cancelled" };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/* =========================
   EXPIRE OLD RESERVATIONS
========================= */
export const expireReservationsService = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // หา pending ที่หมดเวลา
    const [expired]: any = await connection.query(
      `
      SELECT id, slot_id FROM reservations
      WHERE status = 'pending'
      AND expires_at < NOW()
      `
    );

    if (expired.length === 0) {
      await connection.commit();
      return { expired: 0 };
    }

    const ids = expired.map((r: any) => r.id);
    const slotIds = expired.map((r: any) => r.slot_id);

    // update reservation
    await connection.query(
      `
      UPDATE reservations
      SET status = 'cancelled'
      WHERE id IN (?)
      `,
      [ids]
    );

    // update spots
    await connection.query(
      `
      UPDATE parking_spots
      SET status = 'available'
      WHERE id IN (?)
      `,
      [slotIds]
    );

    await connection.commit();

    return { expired: expired.length };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};