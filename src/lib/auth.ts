import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { NextAuthOptions } from 'next-auth';
import { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';

declare module 'next-auth' {
  interface User {
    role: string;
  }
  interface Session {
    user: {
      role: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface User {
  id: number;
  email: string;
  password?: string | null;
  name?: string | null;
  role: 'ADMIN' | 'STUDENT';
  isActive: boolean;
  magicToken?: string | null;
  tokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export async function createAdminUser(email: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User } | null> {
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

export async function createMagicLink(email: string): Promise<boolean> {
  const token = randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.upsert({
    where: { email },
    update: {
      magicToken: token,
      tokenExpiry: expiry,
    },
    create: {
      email,
      magicToken: token,
      tokenExpiry: expiry,
    },
  });

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@example.com',
    to: email,
    subject: 'Your Magic Link for iPhone Creator Course',
    html: `
      <h1>Welcome to iPhone Creator Course!</h1>
      <p>Click the link below to access your account:</p>
      <a href="${magicLink}">${magicLink}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });

  return true;
}

export async function verifyMagicLink(token: string): Promise<{ token: string; user: User } | null> {
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

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch {
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || '',
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

module.exports = {
  createAdminUser,
  loginUser,
  createMagicLink,
  verifyMagicLink,
  verifyToken,
  isAdmin
}; 