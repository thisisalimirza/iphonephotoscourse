'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import Link from 'next/link';
import { BookOpenIcon, AcademicCapIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-200 fixed">
          <nav className="mt-6 px-4">
            <div className="space-y-4">
              <Link 
                href="/courses" 
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
              >
                <BookOpenIcon className="h-5 w-5 mr-3 text-gray-500" />
                My Courses
              </Link>

              {isAdmin && (
                <Link 
                  href="/admin/courses" 
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
                >
                  <AcademicCapIcon className="h-5 w-5 mr-3 text-gray-500" />
                  Admin Panel
                </Link>
              )}

              <Link 
                href="/profile" 
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
              >
                <UserIcon className="h-5 w-5 mr-3 text-gray-500" />
                Profile
              </Link>

              <Link 
                href="/settings" 
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-500" />
                Settings
              </Link>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 ml-64">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 