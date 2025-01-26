import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ReorderLesson {
  id: number;
  order: number;
}

export async function PUT(request: Request) {
  try {
    const { lessons } = await request.json();

    // Update each lesson's order in a transaction
    await prisma.$transaction(
      lessons.map((lesson: ReorderLesson) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: { order: lesson.order }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    return NextResponse.json(
      { error: 'Failed to reorder lessons' },
      { status: 500 }
    );
  }
} 