'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import AuthLayout from '@/components/layout/AuthLayout';
import VideoPlayer from '@/components/VideoPlayer';

interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'video';
}

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  duration: string;
  videoUrl: string | null;
  content: string | null;
  resources: Resource[] | null;
  learningObjectives: string[];
  isComplete: boolean;
  moduleId: number;
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      const data = await response.json();
      setLesson(data);
    } catch (err) {
      setError('Error loading lesson');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <AuthLayout>
        <div className="p-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </AuthLayout>
    );
  }

  if (!lesson) {
    return (
      <AuthLayout>
        <div className="p-8">
          <div className="text-center">Lesson not found</div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/courses" className="flex items-center text-gray-500 hover:text-gray-900">
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Back to Course
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href={`/courses/lesson/${parseInt(lessonId) - 1}`}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Previous
                </Link>
                <Link
                  href={`/courses/lesson/${parseInt(lessonId) + 1}`}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Next
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <div className="text-gray-500">{lesson.duration}</div>
            {lesson.description && (
              <p className="text-gray-600">{lesson.description}</p>
            )}
          </div>

          {/* Learning Objectives */}
          {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
            <div className="mb-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">What You&apos;ll Learn</h3>
              <ul className="space-y-2">
                {lesson.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-blue-900">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Video */}
          {lesson.videoUrl && (
            <div className="mb-8">
              <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
            </div>
          )}

          {/* Lesson content */}
          {lesson.content && (
            <div className="prose max-w-none mb-8">
              {lesson.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
              <div className="space-y-3">
                {lesson.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-white rounded-md text-blue-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    {resource.type === 'pdf' && '📄 '}
                    {resource.type === 'video' && '🎥 '}
                    {resource.type === 'link' && '🔗 '}
                    <span className="ml-2">{resource.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
} 