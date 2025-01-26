import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.type === 'video.asset.ready') {
      // Find the lesson with this asset ID
      const lesson = await prisma.lesson.findFirst({
        where: { videoAssetId: body.data.id }
      });

      if (lesson) {
        // Update the lesson status
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { videoStatus: 'ready' }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 