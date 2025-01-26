import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

type DefaultArgs = Prisma.PrismaClientOptions;

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const showUnpublished = includeUnpublished && user.role === 'ADMIN';

    const modules = await prisma.module.findMany({
      where: showUnpublished ? {} : { published: true },
      include: {
        lessons: {
          where: showUnpublished ? {} : { published: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const lastModule = await prisma.module.findFirst({
      orderBy: { order: 'desc' }
    });
    const order = lastModule ? lastModule.order + 1 : 1;

    const newModule = await prisma.module.create({
      data: {
        title: data.title,
        description: data.description || '',
        order,
        published: false
      }
    });

    return NextResponse.json(newModule);
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
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
    const updatedModule = await prisma.module.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
        published: data.published,
        lastModifiedAt: new Date(),
      } as Prisma.ModuleUpdateInput,
    });
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Error updating module' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    // Delete module and all its lessons in a transaction
    await prisma.$transaction(async (tx: TransactionClient) => {
      // First delete all lessons in the module
      await tx.lesson.deleteMany({
        where: { moduleId: parseInt(id) },
      });

      // Then delete the module
      await tx.module.delete({
        where: { id: parseInt(id) },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Error deleting module' }, { status: 500 });
  }
} 