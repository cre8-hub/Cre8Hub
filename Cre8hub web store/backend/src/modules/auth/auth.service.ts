import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { pool } from "../../config/db";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)",
    [uuid(), name, email, hash]
  );
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role, // 🔥 ADD THIS
  },
  process.env.JWT_SECRET as string,
  { expiresIn: "7d" }
);

  return { token, user };
};
