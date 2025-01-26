'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { ChevronLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  description: string | null;
  isComplete: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

export default function CoursePage() {
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch('/api/modules');
        const data = await response.json();
        setModules(data);
        // Expand the first module by default
        if (data.length > 0) {
          setExpandedModules([data[0].id]);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, []);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Calculate total progress
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = modules.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.isComplete).length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Progress bar */}
      <div className="bg-blue-50 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600 font-medium">{progress}% COMPLETE</span>
            <Link href="/courses" className="text-gray-600 hover:text-gray-900">
              iPhone Creator Course
            </Link>
          </div>
          {modules.length > 0 && modules[0].lessons.length > 0 && (
            <Link
              href={`/courses/lesson/${modules[0].lessons[0].id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
            >
              {progress === 0 ? 'Start Course' : 'Continue Course'}
              <ChevronLeftIcon className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold mb-8">Course Curriculum</h1>

          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
            {modules.map((module) => (
              <div key={module.id} className="p-4">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <span className="font-medium">{module.title}</span>
                    {module.description && (
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    )}
                  </div>
                  <ChevronDownIcon 
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedModules.includes(module.id) ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedModules.includes(module.id) && (
                  <div className="mt-4 space-y-2">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-md"
                      >
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          lesson.isComplete ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`} />
                        <Link href={`/courses/lesson/${lesson.id}`} className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {lesson.title}
                          </span>
                          {lesson.description && (
                            <p className="text-sm text-gray-500">{lesson.description}</p>
                          )}
                        </Link>
                        <span className="text-sm text-gray-500">{lesson.duration}</span>
                        <Link
                          href={`/courses/lesson/${lesson.id}`}
                          className="px-3 py-1 text-sm text-blue-600 font-medium rounded-md hover:bg-blue-50"
                        >
                          {lesson.isComplete ? 'Review' : 'Start'}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
} 