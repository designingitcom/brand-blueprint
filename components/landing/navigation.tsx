'use client';
import { useState } from 'react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Features', href: '#features' },
    { label: 'Modules', href: '#modules' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl text-neutral-900 tracking-tight">
              S1BMW
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navigationItems.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="text-neutral-600 hover:text-neutral-900 transition-colors text-lg"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="/login"
              className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Log In
            </a>
            <button className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-neutral-200">
            <div className="flex flex-col space-y-6">
              {navigationItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-neutral-600 hover:text-neutral-900 transition-colors text-lg py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-6">
                <a
                  href="/login"
                  className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-4 py-2 rounded-lg text-sm transition-colors text-center"
                >
                  Log In
                </a>
                <button className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
