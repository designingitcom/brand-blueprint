import { ImageWithFallback } from './figma/ImageWithFallback';

export function FeaturesSection() {
  const features = [
    {
      number: '01',
      title: 'Question Mapping Graph Intelligence',
      subtitle: '1,800+ Strategic Relationships → Zero Strategic Blind Spots',
      description:
        'Our proprietary Question Mapping Graph reveals hidden connections between strategic elements. When you answer questions about positioning, it automatically informs your messaging, which impacts your content strategy, which affects your outbound approach.',
      benefits: [
        '1,800+ strategic relationships mapped and validated',
        'Automatic consistency checking across all brand elements',
        'AI identifies contradictions before they become problems',
        'Strategic decisions cascade through all marketing activities',
      ],
      highlight:
        'Never have off-brand messaging or contradictory positioning across channels again.',
      image:
        'https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidXNpbmVzcyUyMHN0cmF0ZWd5JTIwbWVldGluZ3xlbnwxfHx8fDE3NTg3ODYzNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reverse: false,
    },
    {
      number: '02',
      title: 'Strategy-to-Execution Bridge',
      subtitle: 'End Implementation Gaps Forever',
      description:
        'The first platform to eliminate the strategy implementation gap. Every strategic decision automatically flows into actionable deliverables: website specifications, content calendars, outbound sequences, and team SOPs.',
      benefits: [
        'Strategy automatically becomes executable plans',
        'Website wireframes generated from brand strategy',
        'Content calendars aligned with customer journey',
        'Outbound sequences match brand voice perfectly',
      ],
      highlight:
        '100% strategy implementation rate vs. industry average of 33%.',
      image:
        'https://images.unsplash.com/photo-1721593979313-8661afd501c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwcm9mZXNzaW9uYWwlMjBkYXNoYm9hcmQlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzU4Nzg2MzU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reverse: true,
    },
    {
      number: '03',
      title: 'Multi-Channel Outbound Orchestration',
      subtitle: 'Systematic Pipeline Creation Across All Channels',
      description:
        'Coordinate email, LinkedIn, cold calling, and direct mail in perfect harmony. Each touchpoint reinforces your brand message while moving prospects through a scientifically designed conversion sequence.',
      benefits: [
        'Cross-channel message consistency and timing',
        'Behavioral triggers optimize touchpoint sequence',
        'Advanced lead scoring and qualification automation',
        'Complete pipeline attribution and optimization',
      ],
      highlight:
        'Predictable pipeline with 5x higher conversion rates than single-channel approaches.',
      image:
        'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtaW5pbWFsaXN0JTIwb2ZmaWNlJTIwd29ya3NwYWNlfGVufDF8fHx8MTc1ODc4NjM2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reverse: false,
    },
    {
      number: '04',
      title: 'Human-in-the-Loop AI Intelligence',
      subtitle: 'AI Suggests → You Refine → Expert Validates',
      description:
        "Our AI doesn't replace human creativity—it amplifies it. The system analyzes your previous answers, industry patterns, and confidence levels to provide contextual suggestions while you maintain complete creative control.",
      benefits: [
        'Context-aware suggestions that get smarter with every answer',
        'Industry-specific recommendations based on proven patterns',
        'Confidence calibration ensures AI knows when to suggest vs. stay quiet',
        'Expert strategist validation available for complex decisions',
      ],
      highlight:
        'Like having a McKinsey-level strategist available 24/7, but one that knows your business intimately.',
      image:
        'https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Nlc3MlMjBhdXRvbWF0aW9ufGVufDF8fHx8MTc1ODc4NjM4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reverse: true,
    },
  ];

  return (
    <section className="py-32 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-24">
          <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
            How S1BMW Eliminates Every Growth Challenge
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
            Four breakthrough innovations that transform how businesses approach
            strategic growth
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center ${
                feature.reverse ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Image */}
              <div
                className={`${feature.reverse ? 'lg:col-start-2' : ''} relative`}
              >
                <div className="relative rounded-2xl overflow-hidden bg-neutral-200 aspect-[4/3]">
                  <ImageWithFallback
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="text-4xl lg:text-5xl font-light text-white/90 bg-neutral-900/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      {feature.number}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className={`${feature.reverse ? 'lg:col-start-1' : ''} space-y-8`}
              >
                <div>
                  <h3 className="text-3xl lg:text-4xl text-neutral-900 mb-6 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg lg:text-xl text-neutral-600 mb-8 leading-relaxed">
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
                      <span className="text-neutral-700 leading-relaxed">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Highlight */}
                <div className="bg-white p-8 rounded-2xl border border-neutral-200">
                  <p className="text-neutral-700 leading-relaxed">
                    <span className="text-neutral-900">Real Impact:</span>{' '}
                    {feature.highlight}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
