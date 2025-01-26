import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function PUT(request: Request) {
  try {
    const { modules } = await request.json();

    // Update all modules and their lessons in a transaction
    await prisma.$transaction(async (tx: TransactionClient) => {
      // Update module orders
      for (const courseModule of modules) {
        await tx.module.update({
          where: { id: courseModule.id },
          data: { order: courseModule.order }
        });

        // Update lesson orders if they exist
        if (courseModule.lessons) {
          for (const lesson of courseModule.lessons) {
            await tx.lesson.update({
              where: { id: lesson.id },
              data: { order: lesson.order }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering modules:', error);
    return NextResponse.json(
      { error: 'Failed to reorder modules' },
      { status: 500 }
    );
  }
} 