'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserCircleIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  Cog8ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'My Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  { name: 'Subscriptions', href: '/subscriptions', icon: ClipboardDocumentListIcon },
  { name: 'Courses', href: '/courses', icon: AcademicCapIcon },
  { name: 'Admin Panel', href: '/admin/courses', icon: Cog8ToothIcon, adminOnly: true },
];

export default function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname();

  const isAdmin = user?.role === 'ADMIN';
  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <button
          onClick={() => {/* TODO: Implement logout */}}
          className="flex-shrink-0 w-full group block"
        >
          <div className="flex items-center">
            <ArrowRightOnRectangleIcon className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Logout
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
} 