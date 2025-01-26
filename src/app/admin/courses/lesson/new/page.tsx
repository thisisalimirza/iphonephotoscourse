'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '../../../../../components/layout/AuthLayout';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import VideoPlayer from '../../../../../components/VideoPlayer';

interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'video';
}

export default function NewLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState<Resource>({ title: '', url: '', type: 'link' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!moduleId) {
      setError('Module ID is required');
      setLoading(false);
      return;
    }

    try {
      // Format the resources array to ensure it's valid JSON
      const formattedResources = resources.map(resource => ({
        title: resource.title,
        url: resource.url,
        type: resource.type
      }));

      const lessonData = {
        title: title.trim(),
        description: description.trim() || null,
        duration: duration.trim() || null,
        videoUrl: videoUrl.trim() || null,
        content: content.trim() || null,
        learningObjectives: learningObjectives.map(obj => obj.trim()),
        resources: formattedResources.length > 0 ? formattedResources : null,
        moduleId: parseInt(moduleId),
        published: false,
      };

      console.log('Sending lesson data:', lessonData);

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lesson');
      }

      router.push('/admin/courses');
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setResources([...resources, { ...newResource }]);
      setNewResource({ title: '', url: '', type: 'link' });
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setLearningObjectives([...learningObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="max-w-4xl">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>

          <h1 className="text-2xl font-bold mb-8">Add New Lesson</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 10:00"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Video URL</label>
              <div className="mt-1 space-y-4">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter video URL (YouTube, Google Drive, or direct MP4 link)"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {videoUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Preview</label>
                    <VideoPlayer url={videoUrl} title={title} />
                  </div>
                )}
                <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-600">
                  <h4 className="font-medium mb-2">Supported Video Sources:</h4>
                  <ul className="space-y-2">
                    <li>
                      <span className="font-medium">YouTube:</span> Use either the regular watch URL (https://youtube.com/watch?v=...) 
                      or short URL (https://youtu.be/...). The video will be embedded securely.
                    </li>
                    <li>
                      <span className="font-medium">Google Drive:</span> Upload your video to Drive, right-click → Share → 
                      Copy link. Make sure to set access to "Anyone with the link can view".
                    </li>
                    <li>
                      <span className="font-medium">Direct MP4:</span> If hosting your own video files, use a direct MP4 URL. 
                      Recommended format: H.264 encoding at 720p or 1080p resolution.
                    </li>
                  </ul>
                  <p className="mt-3 text-amber-600">
                    <strong>Note:</strong> Videos are protected against downloading and sharing. Students can only watch them 
                    through the course platform.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Learning Objectives</label>
              
              <div className="space-y-4 mb-4">
                {learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">• {objective}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Enter a learning objective"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addObjective();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addObjective}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Resources</label>
              
              <div className="space-y-4 mb-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{resource.title}</div>
                      <div className="text-sm text-gray-500">{resource.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Resource Title"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  placeholder="URL"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value as 'pdf' | 'link' | 'video' })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                </select>
                <button
                  type="button"
                  onClick={addResource}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/courses')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
} 