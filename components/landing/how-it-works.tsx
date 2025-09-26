'use client';

export function HowItWorksSection() {
  const phases = [
    {
      number: '01',
      title: 'Foundation Phase',
      timeframe: 'Week 1-2 | Strategy Foundation',
      steps: [
        'Business Setup & Onboarding (15 minutes)',
        "Strategic Foundation Workshop - M1's 57 core questions (2-3 hours)",
        'Customer Understanding & Personas - M2 (1 hour)',
        'Brand Voice & Messaging - M7 & M10 (1-2 hours)',
        'Living Brand Guide Generation (Instant)',
      ],
      outcome: 'Strategic foundation becomes DNA for all future activities',
    },
    {
      number: '02',
      title: 'Execution Phase',
      timeframe: 'Week 2-4 | Website & Content Systems',
      steps: [
        'Website Strategy & Planning - M12-M15 (3-4 hours)',
        'Content Strategy & Journey Mapping - M18-M19 (2 hours)',
        'Website Development & Launch (1-2 weeks)',
        'Content Calendar & SEO Strategy Setup (2-3 hours)',
        'Brand consistency systems activated',
      ],
      outcome: 'All outputs aligned with strategic foundation',
    },
    {
      number: '03',
      title: 'Growth Phase',
      timeframe: 'Ongoing | Outbound & Optimization',
      steps: [
        'Lead Source Integration & Scoring Setup',
        'Outbound Orchestration & Sequence Creation',
        'Content Production & Distribution Automation',
        'Performance Tracking & Attribution Setup',
        'Continuous optimization based on data',
      ],
      outcome: 'Complete growth engine operating at scale',
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-24">
          <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
            How S1BMW Growth OS Works
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
            From strategic foundation to complete growth engine in three
            systematic phases
          </p>
        </div>

        <div className="space-y-24">
          {phases.map((phase, index) => (
            <div
              key={index}
              className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16 items-start"
            >
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

              {/* Steps */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {phase.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex items-start gap-4 py-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-3 flex-shrink-0"></div>
                      <span className="text-neutral-700 leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              <div className="lg:col-span-1">
                <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200">
                  <h4 className="text-lg text-neutral-900 mb-4">Outcome</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    {phase.outcome}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-neutral-600 mb-8">
              Ready to start your 90-day transformation?
            </p>
            <button className="px-10 py-4 text-lg bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors">
              Begin Phase 1
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
