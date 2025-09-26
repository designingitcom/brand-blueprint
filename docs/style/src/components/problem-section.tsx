export function ProblemSection() {
  const problems = [
    {
      number: '01',
      title: 'Fragmented Strategy',
      description:
        'Multiple disconnected frameworks and tools create confusion instead of clarity. Teams work in silos without unified strategic direction.',
    },
    {
      number: '02',
      title: 'Strategic Blind Spots',
      description:
        'Critical strategic questions remain unanswered, leading to poor positioning, unclear messaging, and missed market opportunities.',
    },
    {
      number: '03',
      title: 'Execution Gaps',
      description:
        'Beautiful strategies that never translate to action. The gap between strategic planning and practical implementation kills momentum.',
    },
    {
      number: '04',
      title: 'Inconsistent Results',
      description:
        'Unpredictable pipeline performance due to reactive, ad-hoc marketing and sales activities without systematic approach.',
    },
    {
      number: '05',
      title: 'Slow Decision Making',
      description:
        'Endless debates and analysis paralysis when strategic clarity is missing. Teams waste time on wrong priorities.',
    },
    {
      number: '06',
      title: 'No Revenue Attribution',
      description:
        "Can't trace results back to strategic decisions. Unable to identify what's working or optimize for better performance.",
    },
  ];

  return (
    <section className="py-32 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-24">
          <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
            The Strategy-Execution Gap
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
            Most B2B companies struggle with disconnected strategies, fragmented
            execution, and unpredictable results
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {problems.map((problem, index) => (
            <div key={index} className="group">
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <span className="text-6xl lg:text-7xl font-light text-neutral-200 group-hover:text-neutral-300 transition-colors">
                    {problem.number}
                  </span>
                </div>
                <div className="pt-4">
                  <h3 className="text-2xl lg:text-3xl text-neutral-900 mb-6 leading-tight">
                    {problem.title}
                  </h3>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    {problem.description}
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
