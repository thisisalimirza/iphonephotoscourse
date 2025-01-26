'use client';

import React from 'react';
import Link from 'next/link';

export function MainNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              iPhone Creator Course
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              Login
            </Link>
            <Link
              href="/enroll"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Unlock the Course
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 