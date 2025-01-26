import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    const isAdmin = user?.role === 'ADMIN';
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        moduleId: parseInt(moduleId),
        ...(isAdmin ? {} : { module: { published: true } as Prisma.ModuleWhereInput }),
      } as Prisma.LessonWhereInput,
      orderBy: {
        order: Prisma.SortOrder.asc,
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Error fetching lessons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received data:', data);

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    if (!data.title || !data.moduleId) {
      return NextResponse.json({ 
        error: 'Title and moduleId are required fields' 
      }, { status: 400 });
    }

    const lessonData: Prisma.LessonCreateInput = {
      title: String(data.title).trim(),
      description: data.description ? String(data.description).trim() : null,
      duration: data.duration ? String(data.duration).trim() : "",
      videoUrl: data.videoUrl ? String(data.videoUrl).trim() : null,
      content: data.content ? String(data.content).trim() : null,
      resources: data.resources || null,
      learningObjectives: data.learningObjectives || [],
      module: {
        connect: { id: parseInt(String(data.moduleId)) }
      }
    };

    console.log('Formatted lesson data:', lessonData);

    const newLesson = await prisma.lesson.create({
      data: lessonData
    });
    
    return NextResponse.json(newLesson);
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: 'Error creating lesson. Please try again.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const updatedLesson = await prisma.lesson.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        content: data.content,
        resources: data.resources,
        learningObjectives: data.learningObjectives,
        order: data.order,
        videoUrl: data.videoUrl,
      } as Prisma.LessonUpdateInput,
    });
    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Error updating lesson' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }
    await prisma.lesson.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Error deleting lesson' }, { status: 500 });
  }
} 