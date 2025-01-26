'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import VideoPlayer from '@/components/VideoPlayer';

interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'video';
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  resources?: Resource[];
  learningObjectives: string[];
  isComplete: boolean;
  moduleId: number;
  order: number;
}

export default function LessonEditPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const moduleId = params.moduleId as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState<Resource>({ title: '', url: '', type: 'link' });
  const [error, setError] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState('');

  useEffect(() => {
    if (lessonId === 'new') {
      // Initialize empty lesson for new creation
      setLesson({
        id: 0,
        title: '',
        description: '',
        duration: '',
        videoUrl: '',
        content: '',
        resources: [],
        learningObjectives: [],
        isComplete: false,
        moduleId: parseInt(moduleId),
        order: 0
      });
      setLoading(false);
    } else {
      fetchLesson();
    }
  }, [lessonId, moduleId]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      const data = await response.json();
      setLesson(data);
      setResources(data.resources || []);
      setLearningObjectives(data.learningObjectives || []);
      if (data.videoUrl) {
        setVideoPreviewUrl(data.videoUrl);
      }
    } catch (err) {
      setError('Error loading lesson');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lesson) return;

    try {
      const formData = new FormData(e.currentTarget);
      const lessonData = {
        ...lesson,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        duration: formData.get('duration') as string,
        videoUrl: formData.get('videoUrl') as string || undefined,
        content: formData.get('content') as string,
        resources: resources,
        learningObjectives: learningObjectives,
        moduleId: parseInt(moduleId)
      };

      const response = await fetch('/api/lessons', {
        method: lessonId === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save lesson');
      }
      
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError(error instanceof Error ? error.message : 'Failed to save lesson');
    }
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setResources([...resources, newResource]);
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

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!lesson) {
    return (
      <AuthLayout>
        <div className="p-8">
          <div className="text-center text-red-600">{error || 'Lesson not found'}</div>
        </div>
      </AuthLayout>
    );
  }

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

          <h1 className="text-2xl font-bold mb-8">
            {lessonId === 'new' ? 'Add Lesson' : 'Edit Lesson'}
          </h1>

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
                name="title"
                defaultValue={lesson.title}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                defaultValue={lesson.description || ''}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                name="duration"
                defaultValue={lesson.duration}
                placeholder="e.g. 10:00"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Video URL</label>
              <div className="mt-1 space-y-4">
                <input
                  type="url"
                  name="videoUrl"
                  defaultValue={lesson?.videoUrl || ''}
                  onChange={(e) => setVideoPreviewUrl(e.target.value)}
                  placeholder="Enter video URL (YouTube, Google Drive, or direct MP4 link)"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {videoPreviewUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Preview</label>
                    <VideoPlayer url={videoPreviewUrl} title={lesson?.title} />
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
                name="content"
                defaultValue={lesson.content || ''}
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
} 