'use client';
import { ImageWithFallback } from './image-with-fallback';

interface ValuePropCardProps {
  item: {
    title: string;
    desc: string;
    icon: React.ReactNode;
  };
  index: number;
}

function ValuePropCard({ item, index }: ValuePropCardProps) {
  return (
    <div
      className="group bg-white border border-neutral-200 rounded-2xl p-8 hover:border-neutral-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Icon */}
      <div className="text-neutral-600 mb-6 group-hover:text-neutral-900 transition-colors">
        {item.icon}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h4 className="text-xl text-neutral-900 leading-tight">{item.title}</h4>
        <p className="text-neutral-600 leading-relaxed">{item.desc}</p>
      </div>

      {/* Arrow */}
      <div className="mt-6 flex justify-start">
        <div className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-neutral-50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-neutral-50 to-transparent"></div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40 lg:pb-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Refined badge */}
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-600">
                Strategy-First Growth OS
              </span>
            </div>

            {/* Main headline with better typography */}
            <h1 className="text-5xl lg:text-7xl xl:text-8xl tracking-tight text-neutral-900 mb-8">
              Complete B2B Pipeline
              <br />
              in <span className="text-neutral-500">90 Days</span>
            </h1>

            {/* Refined subheading */}
            <p className="text-xl lg:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Through 20+ Integrated Strategy Modules
            </p>

            {/* Better description */}
            <p className="text-lg lg:text-xl text-neutral-500 mb-16 max-w-4xl mx-auto leading-relaxed">
              From strategic foundation to revenue attribution - the complete
              growth operating system that bridges strategy and execution
              without gaps.
            </p>

            {/* Sophisticated value prop cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
              {[
                {
                  title: 'Strategy-Execution Bridge',
                  desc: 'End the 67% strategy failure rate. Every strategic decision automatically flows into executable deliverables and team actions.',
                  icon: (
                    <svg
                      className="w-8 h-8"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="8"
                        cy="16"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle
                        cx="24"
                        cy="16"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M14 16h4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  ),
                },
                {
                  title: 'Unified Growth Operating System',
                  desc: 'Replace 12+ disconnected tools with one intelligent system. Complete attribution from strategy to revenue.',
                  icon: (
                    <svg
                      className="w-8 h-8"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="8"
                        height="8"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <rect
                        x="20"
                        y="4"
                        width="8"
                        height="8"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <rect
                        x="4"
                        y="20"
                        width="8"
                        height="8"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <rect
                        x="20"
                        y="20"
                        width="8"
                        height="8"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle cx="16" cy="16" r="2" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  title: 'Agency-Level Expertise Built-In',
                  desc: 'Access McKinsey-level strategic frameworks and execution playbooks without $75K+ agency fees or long timelines.',
                  icon: (
                    <svg
                      className="w-8 h-8"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle cx="16" cy="16" r="2" fill="currentColor" />
                    </svg>
                  ),
                },
              ].map((item, index) => (
                <ValuePropCard key={index} item={item} index={index} />
              ))}
            </div>

            {/* Refined CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 text-lg bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors">
                Start Your 90-Day Pipeline
              </button>
              <button className="px-10 py-4 text-lg border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors">
                Book Strategy Session
              </button>
            </div>
          </div>
        </div>

        {/* Clean number overlay - positioned safely */}
        <div className="absolute bottom-8 right-8 text-[12rem] lg:text-[16rem] xl:text-[20rem] font-light text-neutral-100 select-none pointer-events-none hidden lg:block">
          90
        </div>
      </div>
    </section>
  );
}
