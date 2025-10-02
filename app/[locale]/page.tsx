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
                Through 21 Integrated Strategy Modules
              </p>

              {/* Better description */}
              <p className="text-lg lg:text-xl text-neutral-500 mb-16 max-w-4xl mx-auto leading-relaxed">
                From strategic foundation to revenue attribution - the complete growth operating system that bridges strategy and execution without gaps.
              </p>

              {/* Sophisticated value prop cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
                {[
                  {
                    title: 'Strategy-Execution Bridge',
                    desc: 'End the 67% strategy failure rate. Every strategic decision automatically flows into executable deliverables and team actions.',
                  },
                  {
                    title: 'Unified Growth Operating System',
                    desc: 'Replace 12+ disconnected tools with one intelligent system. Complete attribution from strategy to revenue.',
                  },
                  {
                    title: 'Agency-Level Expertise Built-In',
                    desc: 'Access McKinsey-level strategic frameworks and execution playbooks without $75K+ agency fees or long timelines.',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group bg-white border border-neutral-200 rounded-2xl p-8 hover:border-neutral-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="space-y-4">
                      <h4 className="text-xl text-neutral-900 leading-tight">{item.title}</h4>
                      <p className="text-neutral-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Refined CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-10 py-4 text-lg bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors"
                >
                  Start Your 90-Day Pipeline
                </Link>
                <a
                  href="#how-it-works"
                  className="px-10 py-4 text-lg border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  See How It Works
                </a>
              </div>
            </div>
          </div>

          {/* Clean number overlay */}
          <div className="absolute bottom-8 right-8 text-[12rem] lg:text-[16rem] xl:text-[20rem] font-light text-neutral-100 select-none pointer-events-none hidden lg:block">
            90
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-32 px-6 lg:px-8 bg-neutral-50">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-6">
              🎯 Why Your Business Is Still Invisible
            </h2>
            <p className="text-xl lg:text-2xl text-neutral-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Most companies have great products but are terrible at explaining why anyone should
              care—leaving money on the table every single day.
            </p>
          </div>

          {/* Major Pain Points */}
          <div className="mb-16">
            <h3 className="text-3xl lg:text-4xl text-neutral-900 mb-12 text-center">
              💔 Major Pain Points
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "You're Trying to Sell to Everyone (And Converting No One)",
                  desc: 'Your marketing speaks to "small businesses" or "professionals" instead of specific people with specific problems, so nobody feels like you are talking directly to them.',
                },
                {
                  title: "Your Sales Team Can't Explain What You Do in 30 Seconds",
                  desc: 'When prospects ask "What do you do?" your team stumbles through long explanations instead of giving a clear, compelling answer that makes people want to learn more.',
                },
                {
                  title: "Customers Can't Tell You Apart from Competitors",
                  desc: 'Your website, proposals, and sales pitches sound exactly like three other companies in your space, so prospects default to choosing based on price alone.',
                },
                {
                  title: 'Your Marketing Budget Gets Wasted on Generic Campaigns',
                  desc: "You're spending thousands on ads, content, and events that attract the wrong people because you don't know exactly who should be buying from you.",
                },
                {
                  title: 'Deals Take Forever to Close (Or Fall Apart Completely)',
                  desc: "Prospects ghost you mid-conversation because they can't figure out if you're worth the investment or how you're different from cheaper alternatives.",
                },
                {
                  title: 'Your AI Content Sounds Like a Robot Wrote It',
                  desc: 'ChatGPT and other tools strip away your personality, making your emails, social posts, and website copy bland and forgettable.',
                },
                {
                  title: 'Every Department Tells a Different Story About Your Company',
                  desc: 'Sales says one thing, marketing says another, and customer success promises something else, confusing customers and killing trust.',
                },
                {
                  title: 'You\'re Losing Deals to "We\'ll Think About It"',
                  desc: "Prospects don't say no—they just disappear because you haven't given them a compelling reason to say yes right now.",
                },
                {
                  title: 'Your Team Wastes Hours Recreating the Same Content',
                  desc: 'Without clear brand guidelines, everyone writes emails, proposals, and presentations from scratch instead of using proven messaging that works.',
                },
              ].map((problem, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl border border-neutral-200">
                  <h4 className="text-xl font-semibold text-neutral-900 mb-3 leading-tight">
                    {problem.title}
                  </h4>
                  <p className="text-neutral-700 leading-relaxed">{problem.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Closing Statement */}
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-lg lg:text-xl text-neutral-700 italic leading-relaxed">
              The answer is not more content or campaigns—it is our revolutionary end-to-end system
              that discovers your brand DNA, crafts your market position, and creates a
              self-improving communication engine no competitor can copy.
            </p>
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
            {[
              {
                title: 'Strategic Foundation',
                desc: 'Build crystal-clear positioning, messaging, and value propositions that resonate with your target market.',
              },
              {
                title: 'Operational Excellence',
                desc: 'Implement systems and processes that scale, with clear workflows and accountability measures.',
              },
              {
                title: 'Market Readiness',
                desc: 'Launch with confidence using proven go-to-market strategies and performance tracking systems.',
              },
            ].map((solution, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-colors">
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">{solution.title}</h3>
                <p className="text-neutral-600">{solution.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Module Showcase */}
      <section id="modules" className="py-32 bg-neutral-900 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-24">
            <h2 className="text-4xl lg:text-6xl tracking-tight mb-8">
              Complete Growth Operating System
            </h2>
            <p className="text-xl lg:text-2xl text-neutral-400 leading-relaxed">
              21 integrated modules covering every aspect of B2B growth - from strategic foundation to revenue optimization
            </p>
          </div>

          <div className="space-y-24">
            {[
              {
                title: 'Strategic Foundation',
                subtitle: 'Core Strategy Modules (M1-M11)',
                modules: [
                  'Brand DNA',
                  'Market Position',
                  'ICP Definition',
                  'Persona Development',
                  'Value Framework',
                  'Brand Voice',
                  'Messaging Architecture',
                  'Content Strategy',
                  'Visual Identity',
                  'Brand Story',
                  'GTM Strategy',
                ],
              },
              {
                title: 'Digital Execution',
                subtitle: 'Website & Content Modules (M12-M17)',
                modules: [
                  'Site Architecture',
                  'Homepage Hero',
                  'Product Pages',
                  'About & Team',
                  'Resources Hub',
                  'Conversion System',
                ],
              },
              {
                title: 'Growth Operations',
                subtitle: 'Pipeline & Marketing Modules (M18-M21)',
                modules: [
                  'Content Engine',
                  'Email Marketing',
                  'Social Media',
                  'Sales Enablement',
                ],
              },
            ].map((group, groupIndex) => (
              <div key={groupIndex} className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                <div className="lg:col-span-1">
                  <h3 className="text-3xl lg:text-4xl text-white mb-4 tracking-tight">
                    {group.title}
                  </h3>
                  <p className="text-lg text-neutral-400 leading-relaxed">
                    {group.subtitle}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {group.modules.map((module, moduleIndex) => (
                      <div
                        key={moduleIndex}
                        className="group flex items-center gap-6 py-4 border-b border-neutral-800 last:border-b-0"
                      >
                        <span className="text-2xl font-light text-neutral-600 group-hover:text-white transition-colors w-12">
                          {String((groupIndex === 0 ? moduleIndex + 1 : groupIndex === 1 ? moduleIndex + 12 : moduleIndex + 18)).padStart(2, '0')}
                        </span>
                        <span className="text-lg lg:text-xl text-neutral-300 group-hover:text-white transition-colors">
                          {module}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Stats */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div>
              <div className="text-5xl lg:text-6xl font-light text-white mb-4">21</div>
              <div className="text-lg text-neutral-400">Integrated Modules</div>
            </div>
            <div>
              <div className="text-5xl lg:text-6xl font-light text-white mb-4">90</div>
              <div className="text-lg text-neutral-400">Days to Pipeline</div>
            </div>
            <div>
              <div className="text-5xl lg:text-6xl font-light text-white mb-4">500+</div>
              <div className="text-lg text-neutral-400">Companies Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-24">
            <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
              6 Breakthrough Innovations
            </h2>
            <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
              How S1BMW transforms strategic growth from concept to revenue
            </p>
          </div>

          <div className="space-y-32">
            {[
              {
                number: '01',
                title: 'Multi-Path Onboarding System',
                subtitle: 'From 15 Minutes to Full Strategic Workshop',
                description:
                  'Choose your journey: Quick Start (15-40 min) for immediate clarity, Fast Track (2-3 hours) for comprehensive strategy, or Strategic Foundation (full workshop) for complete transformation. Each path delivers production-ready brand systems tailored to your timeline.',
                benefits: [
                  'Adaptive question flow that learns from your answers',
                  'AI-powered suggestions based on your industry and goals',
                  'Save and resume anytime without losing progress',
                  'Instant brand guide generation at completion',
                ],
                highlight: 'Complete brand foundations in hours, not months. 500+ companies onboarded successfully.',
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop',
                reverse: false,
              },
              {
                number: '02',
                title: 'Strategy-to-Execution Bridge',
                subtitle: 'End Implementation Gaps Forever',
                description:
                  'The first platform to eliminate the strategy implementation gap. Every strategic decision automatically flows into actionable deliverables: website specifications, content calendars, outbound sequences, and team SOPs. No more translation needed.',
                benefits: [
                  'Strategy automatically becomes executable plans',
                  'Website wireframes generated from brand strategy',
                  'Content calendars aligned with customer journey',
                  'Outbound sequences match brand voice perfectly',
                ],
                highlight: '100% strategy implementation rate vs. industry average of 33%.',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop',
                reverse: true,
              },
              {
                number: '03',
                title: 'End-to-End Closed Loop',
                subtitle: 'From Strategy to Ads to Attribution',
                description:
                  'Complete visibility from strategic decision to campaign performance and back. Launch Facebook ads directly from your brand strategy, track performance in real-time, and automatically feed learnings back into your brand system for continuous optimization.',
                benefits: [
                  'Launch campaigns directly from strategic modules',
                  'Real-time performance tracking and attribution',
                  'Automated A/B testing based on brand variations',
                  'AI recommendations flow back to improve strategy',
                ],
                highlight: 'True closed-loop marketing: Strategy → Execution → Data → Refined Strategy.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
                reverse: false,
              },
              {
                number: '04',
                title: 'Multi-Channel Outbound Orchestration',
                subtitle: 'Systematic Pipeline Creation Across All Channels',
                description:
                  'Coordinate email, LinkedIn, cold calling, and direct mail in perfect harmony. Each touchpoint reinforces your brand message while moving prospects through a scientifically designed conversion sequence with automated behavioral triggers.',
                benefits: [
                  'Cross-channel message consistency and timing',
                  'Behavioral triggers optimize touchpoint sequence',
                  'Advanced lead scoring and qualification automation',
                  'Complete pipeline attribution and optimization',
                ],
                highlight: 'Predictable pipeline with 5x higher conversion rates than single-channel approaches.',
                image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop',
                reverse: true,
              },
              {
                number: '05',
                title: 'Living Brand System',
                subtitle: 'Your Brand Evolves With Your Business',
                description:
                  "Your brand isn't static - our system evolves with your business, learning from performance data and market changes to keep your messaging sharp and effective. Every campaign result improves future recommendations.",
                benefits: [
                  'Real-time performance tracking and optimization',
                  'A/B testing recommendations based on data',
                  'Continuous learning from market feedback',
                  'Adaptive messaging that improves over time',
                ],
                highlight: 'Brands that adapt consistently outperform static competitors by 3-5x.',
                image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&auto=format&fit=crop',
                reverse: false,
              },
              {
                number: '06',
                title: '90-Day Pipeline Guarantee',
                subtitle: 'From Brand Clarity to First Revenue',
                description:
                  'Our proven framework has helped 500+ B2B startups build complete go-to-market systems in 90 days or less. Week-by-week roadmap, automated milestone tracking, and expert review checkpoints ensure you stay on track from strategy to first deal.',
                benefits: [
                  'Week-by-week roadmap with clear milestones',
                  'Milestone tracking and automated alerts',
                  'Expert review checkpoints for validation',
                  'Guaranteed pipeline within 90 days',
                ],
                highlight: 'Average time to first qualified lead: 45 days. Average time to first deal: 75 days.',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop',
                reverse: true,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  feature.reverse ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Image */}
                <div className={`${feature.reverse ? 'lg:col-start-2' : ''} relative`}>
                  <div className="relative rounded-2xl overflow-hidden bg-neutral-200 aspect-[4/3]">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="text-5xl lg:text-6xl font-light text-white/90 bg-neutral-900/30 backdrop-blur-sm px-6 py-3 rounded-xl">
                        {feature.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`${feature.reverse ? 'lg:col-start-1 lg:row-start-1' : ''} space-y-8`}>
                  <div>
                    <h3 className="text-3xl lg:text-4xl text-neutral-900 mb-4 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg lg:text-xl text-neutral-600 mb-6 leading-relaxed">
                      {feature.subtitle}
                    </p>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-4">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-3 flex-shrink-0"></div>
                        <span className="text-neutral-700 leading-relaxed">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Highlight */}
                  <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <p className="text-neutral-700 leading-relaxed">
                      <span className="text-neutral-900 font-medium">Real Impact:</span> {feature.highlight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-24">
            <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
              How S1BMW Growth OS Works
            </h2>
            <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
              From strategic foundation to complete growth engine in three systematic phases
            </p>
          </div>

          <div className="space-y-24">
            {[
              {
                number: '01',
                title: 'Foundation Phase',
                timeframe: 'Days 1-30 | Strategy Foundation',
                steps: [
                  'Brand DNA Workshop (M1-M2)',
                  'ICP & Personas (M3-M4)',
                  'Messaging Architecture (M5-M7)',
                  'Visual Identity (M9-M10)',
                ],
                outcome: 'Strategic foundation becomes DNA for all future activities',
              },
              {
                number: '02',
                title: 'Execution Phase',
                timeframe: 'Days 31-60 | Website & Content Systems',
                steps: [
                  'Website Development (M12-M17)',
                  'Content Strategy (M8)',
                  'Content Engine Setup (M18)',
                  'SEO Foundation',
                ],
                outcome: 'All outputs aligned with strategic foundation',
              },
              {
                number: '03',
                title: 'Growth Phase',
                timeframe: 'Days 61-90 | Outbound & Optimization',
                steps: [
                  'GTM Strategy Launch (M11)',
                  'Multi-Channel Marketing (M19-M20)',
                  'Sales Enablement (M21)',
                  'Performance Optimization',
                ],
                outcome: 'Complete growth engine operating at scale',
              },
            ].map((phase, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16 items-start">
                {/* Phase Header */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-6 mb-6">
                    <span className="text-6xl lg:text-7xl font-light text-neutral-200">
                      {phase.number}
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl text-neutral-900 mb-4 leading-tight">
                    {phase.title}
                  </h3>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    {phase.timeframe}
                  </p>
                </div>

                {/* Steps and Outcome */}
                <div className="lg:col-span-2">
                  {/* Steps - Larger text, tighter spacing */}
                  <div className="space-y-3 mb-8">
                    {phase.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-3 flex-shrink-0"></div>
                        <span className="text-lg text-neutral-700 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Outcome Box */}
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                    <h4 className="text-base font-medium text-neutral-900 mb-3">Outcome</h4>
                    <p className="text-neutral-600 leading-relaxed">{phase.outcome}</p>
                  </div>
                </div>

                {/* Video on the right */}
                <div className="lg:col-span-1">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors cursor-pointer">
                        <svg
                          className="w-5 h-5 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
              Trusted by 500+ B2B Startups
            </h2>
            <p className="text-xl lg:text-2xl text-neutral-600">
              See how companies like yours transformed their go-to-market with S1BMW
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  'S1BMW gave us the strategic clarity we desperately needed. Within 60 days, we had a complete brand system and started generating qualified leads.',
                author: 'Sarah Johnson',
                role: 'CEO, TechFlow Solutions',
              },
              {
                quote:
                  'The multi-path onboarding was brilliant. Everything is interconnected and makes sense. Best SaaS investment we have made.',
                author: 'Michael Chen',
                role: 'Founder, DataSync',
              },
              {
                quote:
                  'We went from figuring it out to having a complete GTM system in 90 days. Our pipeline grew 340% in the first quarter.',
                author: 'Emily Porter',
                role: 'VP Marketing, CloudScale',
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-neutral-200">
                <p className="text-neutral-700 mb-8 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <div className="font-medium text-neutral-900">{testimonial.author}</div>
                  <div className="text-sm text-neutral-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-neutral-600">
              Everything you need to know about the 90-day pipeline system
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'How is this different from traditional brand strategy?',
                answer:
                  'Traditional brand strategy often stays theoretical. S1BMW connects strategy directly to execution with 21 integrated modules covering everything from brand DNA to multi-channel outbound. You are not just getting a brand guide—you are getting a complete growth operating system with immediate activation paths.',
              },
              {
                question: 'What happens in the first 30 days?',
                answer:
                  'The Foundation Phase establishes your strategic core: Brand DNA Workshop (M1-M2), ICP & Persona Development (M3-M5), Messaging Architecture (M6-M7), and Competitive Positioning (M8-M11). By day 30, you have a complete brand foundation that becomes the DNA for all future activities.',
              },
              {
                question: 'Do I need technical knowledge to use the platform?',
                answer:
                  'No technical knowledge required. Our multi-path onboarding adapts to your level—from 15-minute Quick Start to full Strategic Foundation workshop. The platform guides you with AI-powered suggestions, adaptive question flows, and instant brand guide generation.',
              },
              {
                question: 'Can I launch campaigns directly from the platform?',
                answer:
                  'Yes. The End-to-End Closed Loop lets you launch Facebook ads directly from your brand strategy, track performance in real-time, and automatically feed learnings back into your brand system. True strategy-to-execution integration with attribution tracking.',
              },
              {
                question: 'What if I need to adjust my strategy mid-way?',
                answer:
                  'The Living Brand System is designed for evolution. Every module can be refined based on real performance data. Your brand guide updates automatically as you make changes, ensuring your team always works from the latest strategic direction.',
              },
              {
                question: 'How does the 90-day guarantee work?',
                answer:
                  'Follow the three-phase system (Foundation, Activation, Optimization) and complete all recommended modules. If you do not have a complete B2B pipeline with active outbound channels by day 90, we will work with you until you do. No additional cost.',
              },
              {
                question: 'What level of support do I get?',
                answer:
                  'Every account includes strategic guidance through the platform, AI-powered recommendations, and access to our knowledge base. Premium plans include direct access to strategy consultants, weekly office hours, and priority feature requests.',
              },
              {
                question: 'Can my team collaborate within the platform?',
                answer:
                  'Absolutely. Multi-Channel Outbound Orchestration enables team collaboration across email, LinkedIn, partnerships, events, content, and advertising. Track who is working on what, align messaging across channels, and maintain brand consistency effortlessly.',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-8 py-6 text-lg font-medium text-neutral-900 hover:bg-neutral-100 transition-colors">
                  <span>{faq.question}</span>
                  <svg
                    className="w-6 h-6 text-neutral-600 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-8 pb-6 pt-2 text-neutral-700 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-neutral-600 mb-6">Still have questions?</p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 text-neutral-900 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Book a Strategy Call
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-neutral-900 text-white">
        <div className="mx-auto max-w-4xl text-center px-6">
          <h2 className="text-4xl lg:text-6xl tracking-tight mb-8">
            Ready to Build Your Pipeline?
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-400 mb-12 leading-relaxed">
            Join 500+ startups that have transformed their go-to-market strategy with S1BMW
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 text-lg bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Start Your 90-Day Journey
          </Link>
        </div>
      </section>
    </div>
  );
}
