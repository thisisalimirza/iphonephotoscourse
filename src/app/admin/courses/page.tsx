'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import { PlusIcon } from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  isComplete: boolean;
  published: boolean;
  moduleId: number;
  order: number;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
  published: boolean;
  lastPublishedAt?: Date;
  lastModifiedAt?: Date;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border ${bgColor} ${textColor} ${borderColor} shadow-lg max-w-md`}>
      <div className="flex items-center justify-between">
        <p>{message}</p>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>
    </div>
  );
}

function SortableModule({ module, onEdit, onLessonDragEnd, onLessonEdit, setModules, setToast }: { 
  module: Module; 
  onEdit: (id: number) => void;
  onLessonDragEnd: (event: DragEndEvent, moduleId: number) => void;
  onLessonEdit: (id: number) => void;
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; type: 'success' | 'error' } | null>>;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: module.id,
    data: {
      type: 'module',
      module,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/modules/${module.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          description,
          order: module.order
        }),
      });
      if (!response.ok) throw new Error('Failed to update module');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating module:', error);
      alert('Failed to update module. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/modules?id=${module.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete module');
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handlePublish = async (moduleId: number, newStatus: boolean) => {
    try {
      setIsPublishing(true);
      console.log('Publishing module:', moduleId, 'new status:', newStatus);
      
      const response = await fetch(`/api/modules/${moduleId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: newStatus }),
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || 'Failed to update publish status');
      }

      const data = await response.json();
      
      setModules((prevModules: Module[]) => 
        prevModules.map((mod: Module) => {
          if (mod.id === moduleId) {
            const now = new Date();
            return {
              ...mod,
              published: newStatus,
              lastPublishedAt: newStatus ? now : mod.lastPublishedAt,
              lastModifiedAt: !newStatus ? now : mod.lastModifiedAt,
              lessons: mod.lessons.map((lesson: Lesson) => ({
                ...lesson,
                published: newStatus
              }))
            } as Module;
          }
          return mod;
        })
      );

      setToast({ message: data.message || 'Successfully updated publish status', type: 'success' });
    } catch (error) {
      console.error('Error updating publish status:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to update publish status', 
        type: 'error' 
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getPublishStatus = () => {
    if (!module.published) {
      return {
        label: 'Draft',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        buttonLabel: 'Publish',
        buttonColors: 'bg-green-100 text-green-800 hover:bg-green-200'
      };
    }
    
    const hasUnpublishedChanges = module.lastModifiedAt && module.lastPublishedAt && 
      new Date(module.lastModifiedAt) > new Date(module.lastPublishedAt);
    
    if (hasUnpublishedChanges) {
      return {
        label: 'Published (with changes)',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        buttonLabel: 'Publish Changes',
        buttonColors: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      };
    }
    
    return {
      label: 'Published',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      buttonLabel: 'Unpublish',
      buttonColors: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    };
  };

  const publishStatus = getPublishStatus();

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-sm p-6">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Module</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this module? This will also delete all {module.lessons.length} lessons within it. 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Module'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center flex-1">
          <div className="cursor-move mr-3 text-gray-400" {...attributes} {...listeners}>
            ⋮⋮
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold">{isEditing ? '' : title}</h2>
              {!isEditing && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${publishStatus.bgColor} ${publishStatus.textColor}`}>
                  {publishStatus.label}
                </span>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Module title"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Module description"
                  rows={2}
                />
              </div>
            ) : description ? (
              <p className="text-gray-600 mt-1">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handlePublish(module.id, !module.published)}
                disabled={isPublishing}
                className={`px-4 py-2 text-sm font-medium rounded-md ${publishStatus.buttonColors}`}
              >
                {isPublishing ? 'Updating...' : publishStatus.buttonLabel}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-500"
              >
                Quick Edit
              </button>
              <button
                onClick={() => onEdit(module.id)}
                className="text-blue-600 hover:text-blue-500"
              >
                Edit Details
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-500"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <DndContext onDragEnd={(event) => onLessonDragEnd(event, module.id)}>
        <SortableContext
          items={module.lessons.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {module.lessons.map((lesson) => (
              <SortableLesson 
                key={lesson.id} 
                lesson={lesson}
                onEdit={onLessonEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4">
        <button
          onClick={() => router.push(`/admin/courses/lesson/new?moduleId=${module.id}`)}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Lesson
        </button>
      </div>
    </div>
  );
}

function SortableLesson({ lesson, onEdit }: { 
  lesson: Lesson; 
  onEdit: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [duration, setDuration] = useState(lesson.duration);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: lesson.id,
    data: {
      type: 'lesson',
      lesson,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          duration,
          order: lesson.order
        }),
      });
      if (!response.ok) throw new Error('Failed to update lesson');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete lesson';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the default error message
        }
        throw new Error(errorMessage);
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
    >
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Lesson</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this lesson? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center flex-1">
        <div className="cursor-move mr-2" {...attributes} {...listeners}>
          ⋮⋮
        </div>
        {isEditing ? (
          <div className="flex-1 space-x-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lesson title"
            />
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Duration"
            />
          </div>
        ) : (
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-500">{duration}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(lesson.id)}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Edit Details
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Quick Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-500 text-sm"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminCoursePage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules?includeUnpublished=true');
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();
      // Sort modules and lessons by order
      const sortedData = data.sort((a: Module, b: Module) => a.order - b.order).map((module: Module) => ({
        ...module,
        lessons: module.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order)
      }));
      setModules(sortedData);
    } catch (err) {
      setError('Error loading modules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setModules((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));

      // Save the new order
      fetch('/api/modules/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: updatedItems }),
      }).catch((err) => {
        console.error('Error saving order:', err);
        setError('Failed to save order');
      });

      return updatedItems;
    });
  };

  const handleLessonDragEnd = async (event: DragEndEvent, moduleId: number) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setModules((prevModules) => {
      const moduleIndex = prevModules.findIndex((m) => m.id === moduleId);
      if (moduleIndex === -1) return prevModules;

      const currentModule = prevModules[moduleIndex];
      const oldIndex = currentModule.lessons.findIndex((l) => l.id === active.id);
      const newIndex = currentModule.lessons.findIndex((l) => l.id === over.id);

      const newLessons = arrayMove(currentModule.lessons, oldIndex, newIndex).map(
        (lesson, index) => ({ ...lesson, order: index })
      );

      const updatedModule = { ...currentModule, lessons: newLessons };
      const updatedModules = [...prevModules];
      updatedModules[moduleIndex] = updatedModule;

      // Save the new lesson order
      fetch('/api/lessons/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          moduleId,
          lessons: newLessons 
        }),
      }).then(() => {
        // Refresh the modules list after successful reorder
        fetchModules();
      }).catch((err) => {
        console.error('Error saving lesson order:', err);
        setError('Failed to save lesson order');
      });

      return updatedModules;
    });
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

  return (
    <AuthLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="p-8">
        <div className="max-w-4xl">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Course Management</h1>
            <button
              onClick={() => router.push('/admin/courses/module/new')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Module
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleModuleDragEnd}
          >
            <SortableContext
              items={modules.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {modules.map((module) => (
                  <SortableModule
                    key={module.id}
                    module={module}
                    onEdit={(id) => router.push(`/admin/courses/module/${id}`)}
                    onLessonEdit={(id) => router.push(`/admin/courses/lesson/${id}`)}
                    onLessonDragEnd={handleLessonDragEnd}
                    setModules={setModules}
                    setToast={setToast}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </AuthLayout>
  );
} 