'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainNav } from '@/components/layout/MainNav';

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout');
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <MainNav />
      
      {/* Hero section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-sm text-blue-600">
            Master the iPhone
          </div>
          
          <div className="relative mt-8">
            <h1 className="text-[80px] leading-[1.1] font-serif italic text-center text-gray-50">
              Learn <span className="not-italic font-sans font-bold">the correct way to</span>
              <br />
              <span className="not-italic font-sans font-bold">use your iPhone camera</span>
            </h1>
            <h1 className="absolute inset-0 text-[80px] leading-[1.1] font-serif italic text-center bg-gradient-to-b from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Learn <span className="not-italic font-sans font-bold">the correct way to</span>
              <br />
              <span className="not-italic font-sans font-bold">use your iPhone camera</span>
            </h1>
          </div>

          <p className="mt-8 text-lg text-gray-700 max-w-2xl text-center">
            In this step-by-step course, learn the exact settings and techniques to capture amazing photos
            with your iPhone. No experience needed &mdash; just follow the steps and see the difference!
          </p>

          <div className="mt-12 space-y-4">
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-75"
            >
              {isLoading ? "Processing..." : "Unlock course - $79 "}
              <span className="line-through ml-1 text-blue-300">$99</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Photo {i}
            </div>
          ))}
        </div>
      </div>

      {/* What you&apos;ll learn section */}
      <div className="max-w-5xl mx-auto px-6 mt-28">
        <h2 className="text-2xl font-bold text-center mb-14 text-gray-900">What you&apos;ll learn.</h2>
        <div className="grid grid-cols-4 gap-8">
          {learningPoints.map((point, i) => (
            <div 
              key={i} 
              className="bg-white rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-2xl mb-3">{point.icon}</div>
              <h3 className="font-medium text-[15px] mb-2 text-gray-900">{point.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why this course section */}
      <div className="max-w-5xl mx-auto px-6 mt-28">
        <div className="grid grid-cols-2 gap-16">
          <div className="aspect-square bg-gray-100 rounded-lg"></div>
          <div className="pt-4">
            <h2 className="text-2xl font-bold mb-10 text-gray-900">Why this course.</h2>
            {whyPoints.map((point, i) => (
              <div key={i} className="mb-8">
                <h3 className="font-medium text-[15px] mb-2 text-gray-900">{point.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course modules */}
      <div className="max-w-2xl mx-auto px-6 mt-28">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Modules / Lessons</h2>
        <div className="space-y-2.5">
          {courseModules.map((module, i) => (
            <div 
              key={i} 
              className="py-1 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
            >
              <p className="text-sm">{module}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div className="text-center mt-28">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Not ready to buy? Start with a free preview</h2>
        <Link
          href="/signup"
          className="inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Create Free Account
        </Link>
        <p className="mt-4 text-sm text-gray-700">Preview the course content and upgrade anytime</p>
      </div>

      {/* FAQ section */}
      <div className="max-w-2xl mx-auto px-6 mt-28 mb-28">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">FAQ</h2>
        <div>
          {faqItems.map((item, i) => (
            <div key={i} className="border-t border-gray-200">
              <button 
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                className="w-full py-4 flex items-center justify-between text-left group"
              >
                <span className="text-sm text-gray-900 font-medium group-hover:text-blue-700 transition-colors">
                  {item.question}
                </span>
                <span className="ml-6 text-gray-900 text-lg transition-transform duration-200" 
                  style={{ transform: openFaqIndex === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              {openFaqIndex === i && (
                <div className="pb-4 text-sm text-gray-700 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-700">
        © 2024 iPhone Photography Course. All rights reserved.
      </div>
    </div>
  );
}

const learningPoints = [
  {
    icon: '📱',
    title: 'Best Camera Settings',
    description: 'Master the launched settings for any situation and learn how to use your iPhone camera like a pro.',
  },
  {
    icon: '🎨',
    title: 'Color Correction',
    description: 'Learn how to edit colors and make your photos stand out with professional techniques.',
  },
  {
    icon: '⚡',
    title: 'Quick Editing Tips',
    description: 'Master quick editing techniques that will improve your photos in seconds.',
  },
  {
    icon: '📸',
    title: 'iPhone Camera Tricks',
    description: 'Discover hidden features and advanced techniques for stunning photos.',
  },
];

const whyPoints = [
  {
    title: 'For beginners',
    description: 'Whether you\'re just starting out or looking to improve your skills, this course is perfect for all levels.',
  },
  {
    title: 'Easy to understand',
    description: 'Step by step tutorials and practical exercises make learning enjoyable.',
  },
  {
    title: 'Proven techniques',
    description: 'Learn methods used by professional photographers adapted for iPhone.',
  },
];

const courseModules = [
  'Module 1: Introduction to iPhone Photography',
  'Module 2: Understanding Your iPhone Camera',
  'Module 3: Creating Strong Compositions',
  'Module 4: Working with Natural Light',
  'Module 5: Portrait Photography',
  'Module 6: Landscape Photography',
  'Module 7: Advanced Camera Techniques',
  'Module 8: Editing Basics',
  'Module 9: Advanced Editing Skills',
  'Module 10: Creating Your Style',
  'Module 11: Achieving Your Work',
];

const faqItems = [
  { 
    question: 'When does the course start?',
    answer: 'The course starts immediately after enrollment. You\'ll get instant access to all materials and can learn at your own pace.'
  },
  { 
    question: 'What\'s included in the course?',
    answer: 'You\'ll get access to all 11 modules, including video lessons, practical exercises, and downloadable resources. Plus, lifetime access to future updates.'
  },
  { 
    question: 'Will it work for me?',
    answer: 'Yes! This course is designed for all skill levels, from complete beginners to advanced photographers looking to master iPhone photography.'
  },
]; 