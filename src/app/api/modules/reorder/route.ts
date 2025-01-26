import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const { modules } = await request.json();

    // Update all modules and their lessons in a transaction
    await prisma.$transaction(async (tx) => {
      // Update module orders
      for (const module of modules) {
        await tx.module.update({
          where: { id: module.id },
          data: { order: module.order }
        });

        // Update lesson orders within this module
        if (module.lessons) {
          for (const lesson of module.lessons) {
            await tx.lesson.update({
              where: { id: lesson.id },
              data: {
                order: lesson.order,
                moduleId: module.id // Update module assignment in case lesson was moved
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