import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/courses" className="text-xl font-bold text-gray-900">
            iPhone Creator Course
          </Link>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600">
              {user?.name || user?.email}
            </span>
            <button
              onClick={() => logout()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 