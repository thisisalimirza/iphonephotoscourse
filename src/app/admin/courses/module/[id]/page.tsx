'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthLayout from '../../../../../components/layout/AuthLayout';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Module {
  id: number;
  title: string;
  description?: string;
  order: number;
  published: boolean;
  lastPublishedAt?: Date;
  lastModifiedAt?: Date;
}

export default function ModuleEditPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch module');
      }
      const data = await response.json();
      setModule(data);
    } catch (err) {
      setError('Error loading module');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!module) return;

    try {
      const formData = new FormData(e.currentTarget);
      const moduleData = {
        id: parseInt(moduleId),
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        order: module.order,
      };

      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save module');
      }
      
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error saving module:', error);
      setError(error instanceof Error ? error.message : 'Failed to save module');
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

  if (!module) {
    return (
      <AuthLayout>
        <div className="p-8">
          <div className="text-center text-red-600">{error || 'Module not found'}</div>
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

          <h1 className="text-2xl font-bold mb-8">Edit Module</h1>

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
                defaultValue={module.title}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                defaultValue={module.description || ''}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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