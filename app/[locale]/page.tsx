import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <span className="text-2xl text-neutral-900 tracking-tight">S1BMW</span>
            </div>

            <div className="hidden md:flex items-center gap-12">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900 transition-colors text-lg">Features</a>
              <a href="#modules" className="text-neutral-600 hover:text-neutral-900 transition-colors text-lg">Modules</a>
              <a href="#how-it-works" className="text-neutral-600 hover:text-neutral-900 transition-colors text-lg">How It Works</a>
              <a href="#testimonials" className="text-neutral-600 hover:text-neutral-900 transition-colors text-lg">Testimonials</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-4 py-2 rounded-lg text-sm transition-colors">
                Log In
              </Link>
              <Link href="/dashboard" className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-6xl lg:text-7xl font-bold text-neutral-900 tracking-tight mb-8">
              Build Your B2B Pipeline in 90 Days
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Transform your startup into a revenue-generating machine with our comprehensive brand management system. Get strategic clarity, operational excellence, and market readiness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 rounded-lg text-lg transition-colors">
                Start Building Now
              </Link>
              <a href="#features" className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-8 py-4 rounded-lg text-lg transition-colors">
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 px-6 lg:px-8 bg-neutral-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">The Problem Every Startup Faces</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              You have a great product, but struggle with positioning, messaging, and go-to-market strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200">
              <div className="text-red-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Unclear Positioning</h3>
              <p className="text-neutral-600">You can't clearly articulate who you serve and why they should choose you over alternatives.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-200">
              <div className="text-red-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Inconsistent Messaging</h3>
              <p className="text-neutral-600">Your marketing, sales, and product messaging don't align, confusing prospects.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-200">
              <div className="text-red-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Slow Time-to-Market</h3>
              <p className="text-neutral-600">Without strategic clarity, you waste months on trial-and-error instead of systematic growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">Our Solution: The S1BMW System</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              A systematic approach to building your brand, message, and go-to-market strategy in 90 days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-colors">
              <div className="text-green-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Strategic Foundation</h3>
              <p className="text-neutral-600">Build crystal-clear positioning, messaging, and value propositions that resonate with your target market.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-colors">
              <div className="text-green-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Operational Excellence</h3>
              <p className="text-neutral-600">Implement systems and processes that scale, with clear workflows and accountability measures.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-colors">
              <div className="text-green-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Market Readiness</h3>
              <p className="text-neutral-600">Launch with confidence using proven go-to-market strategies and performance tracking systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-neutral-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">Everything You Need to Succeed</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Comprehensive tools and frameworks to build, launch, and scale your B2B business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Brand DNA Workshop</h3>
              <p className="text-neutral-600">Define your core identity, values, and unique positioning in the market.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">ICP & Persona Development</h3>
              <p className="text-neutral-600">Identify and understand your ideal customers with precision.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Messaging Architecture</h3>
              <p className="text-neutral-600">Create compelling, consistent messaging across all touchpoints.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Go-to-Market Strategy</h3>
              <p className="text-neutral-600">Systematic approach to reaching and converting your target market.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Sales Enablement</h3>
              <p className="text-neutral-600">Equip your team with tools and content to close more deals.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Performance Tracking</h3>
              <p className="text-neutral-600">Monitor progress and optimize your strategy with data-driven insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-neutral-900 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Your Pipeline?</h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join hundreds of startups that have transformed their go-to-market strategy with S1BMW.
          </p>
          <Link href="/dashboard" className="bg-white text-neutral-900 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg transition-colors inline-block">
            Start Your 90-Day Journey
          </Link>
        </div>
      </section>
    </div>
  );
}