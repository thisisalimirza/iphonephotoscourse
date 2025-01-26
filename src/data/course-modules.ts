export interface Lesson {
  id: number;
  title: string;
  duration: string;
  isComplete: boolean;
  description?: string;
  videoUrl?: string;
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export const courseModules: Module[] = [
  {
    id: 1,
    title: 'Module 1: Introduction',
    description: 'Get started with iPhone photography basics',
    lessons: [
      { 
        id: 1, 
        title: 'Welcome to the Course!', 
        duration: '10:00', 
        isComplete: false,
        description: 'Overview of what you\'ll learn in this course'
      },
      { 
        id: 2, 
        title: 'Course Overview', 
        duration: '15:00', 
        isComplete: false,
        description: 'A detailed walkthrough of the course structure'
      },
    ],
  },
  {
    id: 2,
    title: 'Module 2: Understanding Your iPhone Camera',
    description: 'Master the fundamental features of your iPhone camera',
    lessons: [
      { 
        id: 3, 
        title: 'Camera Basics', 
        duration: '20:00', 
        isComplete: false,
        description: 'Learn about the essential camera controls and settings'
      },
      { 
        id: 4, 
        title: 'Camera Modes', 
        duration: '25:00', 
        isComplete: false,
        description: 'Explore different shooting modes: Photo, Portrait, Pano, and more'
      },
    ],
  },
  {
    id: 3,
    title: 'Module 3: Composition Techniques',
    description: 'Learn how to compose stunning photos',
    lessons: [
      { 
        id: 5, 
        title: 'Rule of Thirds', 
        duration: '20:00', 
        isComplete: false,
        description: 'Master this fundamental principle of photography composition'
      },
      { 
        id: 6, 
        title: 'Leading Lines', 
        duration: '15:00', 
        isComplete: false,
        description: 'Use lines to create dynamic and engaging photos'
      },
    ],
  },
]; 