'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isComplete: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  lessons: Lesson[];
  published: boolean;
}

export default function CoursesPage() {
  const { user, loading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState('');
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch('/api/modules', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch modules');
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError('Failed to load course content');
      } finally {
        setLoadingModules(false);
      }
    }

    if (user) {
      fetchModules();
    }
  }, [user]);

  if (loading || loadingModules) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view courses</h1>
          <Link 
            href="/signup"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Sign up for free
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = user.paymentStatus === 'PAID';
  const isAdmin = user.role === 'ADMIN';
  const hasFullAccess = isPaid || isAdmin;

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">My Course</h1>
            {isAdmin && (
              <Link 
                href="/admin/courses"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {!hasFullAccess && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold text-yellow-800">Free Preview Mode</h2>
              <p className="text-yellow-700">
                You're viewing the course in preview mode. 
                <Link 
                  href="/pricing" 
                  className="text-yellow-800 font-medium hover:text-yellow-900 ml-2"
                >
                  Upgrade to access all content →
                </Link>
              </p>
            </div>
          )}

          {error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <div className="space-y-6">
              {modules.map((module) => (
                <div key={module.id} className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                  {module.description && (
                    <p className="text-gray-600 mb-4">{module.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-sm text-gray-600">
                      {module.lessons.length} Lessons
                    </div>
                    <div className="text-sm text-gray-600">
                      {module.lessons.filter(l => l.isComplete).length} Completed
                    </div>
                  </div>

                  {/* List of lessons */}
                  <div className="space-y-2 mb-4">
                    {module.lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          {lesson.isComplete ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                          {hasFullAccess && (
                            <Link
                              href={`/courses/lesson/${lesson.id}`}
                              className="text-sm text-blue-600 hover:text-blue-500"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {module.lessons.length > 0 ? (
                      hasFullAccess ? (
                        <Link
                          href={`/courses/lesson/${module.lessons[0].id}`}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
                        >
                          <PlayCircleIcon className="h-5 w-5 mr-2" />
                          Start Module
                        </Link>
                      ) : (
                        <Link
                          href="/pricing"
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Unlock Module
                        </Link>
                      )
                    ) : (
                      <span className="text-sm text-gray-500">No lessons available</span>
                    )}
                  </div>
                </div>
              ))}

              {modules.length === 0 && !error && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No course modules available yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
} 