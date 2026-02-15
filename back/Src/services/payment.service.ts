import { pool } from "../config/db";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

// ==========================
// Create Payment + Generate QR
// ==========================
export const createPayment = async (
  reservationId: number,
  amount: number,
  userId: number
) => {
  // เช็ค reservation ของ user
  const [rows]: any = await pool.query(
    `SELECT id, status 
     FROM reservations 
     WHERE id = ? AND user_id = ?`,
    [reservationId, userId]
  );

  if (rows.length === 0) {
    throw new Error("Reservation not found or not yours");
  }

  if (rows[0].status !== "pending") {
    throw new Error("Reservation is not pending");
  }

  // 🔥 สร้าง PromptPay QR
  const payload = generatePayload("0111111111", { amount }); 
  const qrImage = await QRCode.toDataURL(payload);

  // 🔥 บันทึก payment
  const [result]: any = await pool.query(
    `INSERT INTO payments 
     (reservation_id, amount, payment_method, payment_status) 
     VALUES (?, ?, ?, ?)`,
    [reservationId, amount, "qr", "pending"]
  );

  return {
    message: "Payment created",
    payment_id: result.insertId,
    qr_code: qrImage
  };
};

// ==========================
// Verify Payment
// ==========================
export const verifyPayment = async (
  paymentId: number,
  userId: number
) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [paymentRows]: any = await connection.query(
      `SELECT reservation_id, payment_status
       FROM payments
       WHERE id = ?
       FOR UPDATE`,
      [paymentId]
    );

    if (paymentRows.length === 0) {
      throw new Error("Payment not found");
    }

    if (paymentRows[0].payment_status === "verified") {
      throw new Error("Already verified");
    }

    const reservationId = paymentRows[0].reservation_id;

    const [resRows]: any = await connection.query(
      `SELECT status, user_id
       FROM reservations
       WHERE id = ?
       FOR UPDATE`,
      [reservationId]
    );

    if (resRows.length === 0) {
      throw new Error("Reservation not found");
    }

    if (resRows[0].user_id !== userId) {
      throw new Error("Not authorized");
    }

    if (resRows[0].status !== "pending") {
      throw new Error("Reservation already processed");
    }

    // update payment
    await connection.query(
      `UPDATE payments
       SET payment_status = 'verified',
           paid_at = NOW()
       WHERE id = ?`,
      [paymentId]
    );

    // update reservation
    await connection.query(
      `UPDATE reservations
       SET status = 'paid'
       WHERE id = ?`,
      [reservationId]
    );

    await connection.commit();

    return {
      message: "Payment verified successfully"
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};