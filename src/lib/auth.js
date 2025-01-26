import { prisma } from './prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function createAdminUser(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return null;

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    token: jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' }),
    user,
  };
}

export async function createMagicLink(email) {
  try {
    const response = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to create magic link');
    }

    return true;
  } catch (error) {
    console.error('Failed to create magic link:', error);
    throw error;
  }
}

export async function verifyMagicLink(token) {
  const user = await prisma.user.findUnique({
    where: { magicToken: token },
  });

  if (!user || !user.tokenExpiry || user.tokenExpiry < new Date()) {
    return null;
  }

  // Clear the magic token and update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      magicToken: null,
      tokenExpiry: null,
      lastLoginAt: new Date(),
    },
  });

  return {
    token: jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' }),
    user,
  };
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  return user?.role === 'ADMIN';
} 