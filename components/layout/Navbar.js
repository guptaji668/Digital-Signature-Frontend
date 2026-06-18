'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const navLinks = (
    <>
      <Link href="/verify" onClick={closeMobile} className="text-sm text-gray-600 hover:text-primary-600">
        Verify Document
      </Link>
      {user ? (
        <>
          <Link href="/dashboard" onClick={closeMobile} className="text-sm text-gray-600 hover:text-primary-600">
            Dashboard
          </Link>
          {isAdmin && (
            <Link href="/admin" onClick={closeMobile} className="text-sm text-gray-600 hover:text-primary-600">
              Admin
            </Link>
          )}
          <span className="text-sm text-gray-500">{user.name}</span>
          <button
            onClick={() => { closeMobile(); logout(); }}
            className="btn-secondary text-sm w-full sm:w-auto"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login" onClick={closeMobile} className="text-sm text-gray-600 hover:text-primary-600">
            Login
          </Link>
          <Link href="/register" onClick={closeMobile} className="btn-primary text-sm w-full sm:w-auto text-center">
            Get Started
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeMobile}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">SignDoc</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {navLinks}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks}
          </div>
        </div>
      )}
    </nav>
  );
}
