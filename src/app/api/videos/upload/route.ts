import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { prisma } from '@/lib/prisma';

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID || '',
  process.env.MUX_TOKEN_SECRET || ''
);

export async function POST(request: Request) {
  try {
    const { lessonId, videoUrl } = await request.json();

    // Create a new Mux Asset
    const asset = await Video.Assets.create({
      input: videoUrl,
      playback_policy: ['public'],
      test: process.env.NODE_ENV !== 'production'
    });

    // Update the lesson with the Mux Asset information
    const lesson = await prisma.lesson.update({
      where: { id: parseInt(lessonId) },
      data: {
        videoAssetId: asset.id,
        videoPlaybackId: asset.playback_ids?.[0]?.id,
        videoStatus: 'processing'
      }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Delete the asset from Mux
    await Video.Assets.del(assetId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
} 