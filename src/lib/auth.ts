import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Simple in-memory token store (for production, use a database)
const tokenStore = new Map<string, { adminId: string; expires: number }>();

// Cleanup expired tokens every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of tokenStore.entries()) {
      if (data.expires < now) {
        tokenStore.delete(token);
      }
    }
  }, 10 * 60 * 1000);
}

export function storeToken(token: string, adminId: string): void {
  tokenStore.set(token, { adminId, expires: Date.now() + 24 * 60 * 60 * 1000 });
}

export function validateToken(token: string): { adminId: string } | null {
  const data = tokenStore.get(token);
  if (!data) return null;
  if (data.expires < Date.now()) {
    tokenStore.delete(token);
    return null;
  }
  return { adminId: data.adminId };
}

export function removeToken(token: string): void {
  tokenStore.delete(token);
}
