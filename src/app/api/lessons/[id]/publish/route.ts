import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { published } = await request.json();
    const lessonId = parseInt(params.id);

    // First check if the parent module is published
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (!lesson.module.published && published) {
      return NextResponse.json(
        { error: 'Cannot publish lesson when module is unpublished' },
        { status: 400 }
      );
    }

    // Update lesson publish status
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { published }
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson publish status:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson publish status' },
      { status: 500 }
    );
  }
} 