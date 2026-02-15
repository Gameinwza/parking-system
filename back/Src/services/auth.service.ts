import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}
const SECRET = process.env.JWT_SECRET;

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const generateToken = (user: { id: number; role: string }) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET) as {
    id: number;
    role: string;
  };
};

export const register = async (data: RegisterInput) => {
  const [rows]: any = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [data.email]
  );

  if (rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashed = await bcrypt.hash(data.password, 10);

  await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
    [data.name, data.email, hashed]
  );

  return { message: "User registered" };
};

export const login = async (email: string, password: string) => {
  const [rows]: any = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  const user = rows[0];
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};