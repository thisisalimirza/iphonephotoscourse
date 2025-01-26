import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

export async function PUT(request: Request) {
  try {
    const { modules } = await request.json();

    // Update all modules and their lessons in a transaction
    await prisma.$transaction(async (tx: PrismaClient) => {
      // Update module orders
      for (const courseModule of modules) {
        await tx.module.update({
          where: { id: courseModule.id },
          data: { order: courseModule.order }
        });

        // Update lesson orders within this module
        if (courseModule.lessons) {
          for (const lesson of courseModule.lessons) {
            await tx.lesson.update({
              where: { id: lesson.id },
              data: {
                order: lesson.order,
                moduleId: courseModule.id // Update module assignment in case lesson was moved
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering:', error);
    return NextResponse.json(
      { error: 'Failed to reorder items' },
      { status: 500 }
    );
  }
} 