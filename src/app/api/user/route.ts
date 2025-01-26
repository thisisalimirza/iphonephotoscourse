import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await verifyToken(token);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    const { name, email, billing } = data;

    const user = await prisma.user.update({
      where: { id: userData.id },
      data: {
        name: name || undefined,
        email: email || undefined,
        billing: billing ? JSON.parse(JSON.stringify(billing)) : undefined, // Ensure billing is properly serialized
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 