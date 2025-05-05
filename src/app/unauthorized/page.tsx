'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-xl border border-purple-500/20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image 
              src="/starshop-logos/StarShop-Logo-Landing.svg" 
              alt="StarShop Logo" 
              width={120} 
              height={120} 
              className="animate-pulse"
            />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            You don&apos;t have permission to access this page.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            href={`/auth/login?from=${from}`}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-purple-500/30 rounded-md shadow-sm text-sm font-medium text-purple-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 