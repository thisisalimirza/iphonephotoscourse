import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

export const runtime = 'nodejs';

const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || '',
  tokenSecret: process.env.MUX_TOKEN_SECRET || '',
});

const video = muxClient.video;

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Create a new Mux Asset
    const asset = await video.assets.create({
      input: videoUrl,
      playback_policy: ['public'],
    });

    return NextResponse.json({
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
    });
  } catch (error) {
    console.error('Error creating Mux asset:', error);
    return NextResponse.json(
      { error: 'Failed to create video asset' },
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
    await video.assets.delete(assetId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete video asset' },
      { status: 500 }
    );
  }
} 