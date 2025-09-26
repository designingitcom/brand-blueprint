export function SolutionSection() {
  const solutions = [
    {
      number: '01',
      title: 'Integrated Strategy Framework',
      description:
        '20+ interconnected modules covering every aspect from market analysis to revenue attribution. One unified system instead of fragmented tools.',
    },
    {
      number: '02',
      title: '1,800+ Strategic Relationships',
      description:
        'Question Mapping Graph reveals hidden strategic connections and ensures no critical element is overlooked in your growth strategy.',
    },
    {
      number: '03',
      title: 'Strategy-to-Execution Bridge',
      description:
        'Every strategic decision automatically flows into actionable plans. No more wondering how to implement - the system shows you exactly what to do.',
    },
    {
      number: '04',
      title: 'Human-in-the-Loop AI',
      description:
        'AI suggests, humans refine, experts validate. Get strategic insights without losing human judgment and industry expertise.',
    },
    {
      number: '05',
      title: 'Predictable Pipeline',
      description:
        'Systematic outbound orchestration across multiple channels creates consistent lead flow and predictable revenue growth.',
    },
    {
      number: '06',
      title: 'End-to-End Attribution',
      description:
        "Track every decision from strategic foundation to revenue results. Optimize what works, eliminate what doesn't.",
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-24">
          <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
            The S1BMW Solution
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
            A complete Strategy-First Growth OS that eliminates gaps and
            delivers predictable B2B pipeline growth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {solutions.map((solution, index) => (
            <div key={index} className="group">
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <span className="text-6xl lg:text-7xl font-light text-neutral-200 group-hover:text-neutral-900 transition-colors">
                    {solution.number}
                  </span>
                </div>
                <div className="pt-4">
                  <h3 className="text-2xl lg:text-3xl text-neutral-900 mb-6 leading-tight">
                    {solution.title}
                  </h3>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    {solution.description}
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
