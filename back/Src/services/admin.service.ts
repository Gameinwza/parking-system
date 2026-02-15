import { pool } from "../config/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const getRevenueService = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(amount), 0) as total_revenue 
     FROM payments 
     WHERE payment_status = ?`,
    ["verified"]
  );

  return rows[0];
};

export const getAllUsersService = async () => {
  const [rows] = await pool.query<User[]>(
    "SELECT id, name, email, role FROM users"
  );

  return rows;
};

export const getUserByIdService = async (id: number) => {
  const [rows] = await pool.query<User[]>(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    throw new Error("User not found");
  }

  return rows[0];
};

import bcrypt from "bcrypt";

export const createUserService = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role]
  );

  return {
    message: "User created",
    userId: result.insertId
  };
};

export const updateUserService = async (
  id: number,
  name: string,
  email: string,
  role: string
) => {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
    [name, email, role, id]
  );

  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }

  return { message: "User updated" };
};

export const deleteUserService = async (
  adminId: number,
  targetUserId: number
) => {
  if (adminId === targetUserId) {
    throw new Error("Cannot delete yourself");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [users] = await connection.query<User[]>(
      "SELECT id, role FROM users WHERE id = ?",
      [targetUserId]
    );

    const targetUser = users[0];

    if (!targetUser) {
      throw new Error("User not found");
    }

    if (targetUser.role === "admin") {
      throw new Error("Cannot delete admin users");
    }

    await connection.query(
      "DELETE FROM payments WHERE reservation_id IN (SELECT id FROM reservations WHERE user_id = ?)",
      [targetUserId]
    );

    await connection.query(
      "DELETE FROM reservations WHERE user_id = ?",
      [targetUserId]
    );

    await connection.query(
      "DELETE FROM users WHERE id = ?",
      [targetUserId]
    );

    await connection.commit();

    return {
      message: "User deleted successfully",
      deletedUserId: targetUserId
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
export const createParkingSpotService = async (
  spotNumber: string,
  floor: number
) => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO parking_spots (spot_number, floor)
     VALUES (?, ?)`,
    [spotNumber, floor]
  );

  return {
    message: "Parking spot created",
    spotId: result.insertId
  };
};
