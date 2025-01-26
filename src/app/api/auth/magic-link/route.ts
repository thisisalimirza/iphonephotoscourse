import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

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
        role: 'STUDENT',
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'Failed to create magic link' },
      { status: 500 }
    );
  }
} 