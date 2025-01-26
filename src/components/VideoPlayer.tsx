'use client';

import React, { useEffect, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [videoType, setVideoType] = useState<'youtube' | 'drive' | 'direct'>('direct');
  const [processedUrl, setProcessedUrl] = useState<string>('');

  useEffect(() => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setVideoType('youtube');
      // Convert any YouTube URL to embed format
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]
        : url.split('v=')[1]?.split('&')[0];
      setProcessedUrl(`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`);
    } else if (url.includes('drive.google.com')) {
      setVideoType('drive');
      // Convert Google Drive sharing URL to embed format
      const fileId = url.match(/[-\w]{25,}/);
      if (fileId) {
        setProcessedUrl(`https://drive.google.com/file/d/${fileId[0]}/preview`);
      }
    } else {
      setVideoType('direct');
      setProcessedUrl(url);
    }
  }, [url]);

  if (!processedUrl) return null;

  if (videoType === 'youtube') {
    return (
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src={processedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === 'drive') {
    return (
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src={processedUrl}
          title={title}
          allow="accelerometer; autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video files
  return (
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
      <video
        className="w-full h-full"
        controls
        playsInline
        controlsList="nodownload noremoteplayback" // Prevent downloading and remote playback
        disablePictureInPicture // Prevent picture-in-picture
        onContextMenu={(e) => e.preventDefault()} // Prevent right-click
        title={title}
      >
        <source src={processedUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
} 