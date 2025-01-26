'use client';

import React from 'react';
import Link from 'next/link';

const modules = [
  {
    id: 1,
    title: 'Fundamentals of iPhone Photography',
    description: 'Master the basics of your iPhone camera, including exposure, focus, and composition.',
    lessons: [
      'Understanding Your iPhone Camera',
      'Basic Camera Controls',
      'Composition Rules',
      'Natural Light Photography',
    ],
    duration: '2 hours',
  },
  {
    id: 2,
    title: 'Advanced Camera Techniques',
    description: 'Learn professional techniques like HDR, long exposure, and night mode photography.',
    lessons: [
      'HDR Photography',
      'Night Mode Mastery',
      'Long Exposure Techniques',
      'Action Shots',
    ],
    duration: '2.5 hours',
  },
  {
    id: 3,
    title: 'Photo Editing and Post-Processing',
    description: 'Transform your photos with professional editing techniques using built-in tools and apps.',
    lessons: [
      'Basic Photo Adjustments',
      'Advanced Editing Techniques',
      'Popular Editing Apps',
      'Creating Your Style',
    ],
    duration: '3 hours',
  },
];

export default function ModulesPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Course Modules
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Master iPhone photography through our structured learning path
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.id}
              className="flex flex-col rounded-2xl border border-gray-200 p-8 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900">
                {module.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-gray-600">{module.description}</p>
              <ul className="mt-6 space-y-2">
                {module.lessons.map((lesson, index) => (
                  <li key={index} className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">{lesson}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-x-4">
                <span className="text-sm text-gray-500">
                  Duration: {module.duration}
                </span>
                <Link
                  href={`/modules/${module.id}`}
                  className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Start Module
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 