import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return s;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: object) {
  const secret = getSecret();
  return jwt.sign(payload, secret, { expiresIn: '1d' });
}

export function verifyJwt(token: string) {
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret as string);
    return decoded;
  } catch (error) {
    return null;
  }
}
