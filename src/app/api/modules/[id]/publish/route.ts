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

type Context = {
  params: { id: string };
};

export async function PUT(request: NextRequest, context: Context) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const moduleId = parseInt(context.params.id);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (typeof body?.published !== 'boolean') {
      return NextResponse.json(
        { error: 'Published status must be a boolean' },
        { status: 400 }
      );
    }

    // First update the module
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        published: body.published,
        lastPublishedAt: body.published ? new Date() : null,
        lastModifiedAt: !body.published ? new Date() : null
      }
    });

    // Then update all lessons in this module
    await prisma.lesson.updateMany({
      where: { moduleId },
      data: {
        published: body.published
      }
    });

    return NextResponse.json({
      message: `Module ${body.published ? 'published' : 'unpublished'} successfully`,
      module: updatedModule
    });

  } catch (error) {
    console.error('Error updating module publish status:', error);
    return NextResponse.json(
      { error: 'Failed to update module publish status' },
      { status: 500 }
    );
  }
} 