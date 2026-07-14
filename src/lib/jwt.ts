import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fresher-student-key-12345";

export interface DecodedToken {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: DecodedToken): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || !decoded) {
      return null;
    }
    return decoded as unknown as DecodedToken;
  } catch (error) {
    return null;
  }
}

