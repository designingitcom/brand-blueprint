export function ModulesSection() {
  const moduleGroups = [
    {
      title: "Strategic Foundation",
      subtitle: "Core Strategy Modules",
      modules: [
        "Market Analysis & Positioning",
        "Customer Discovery & Personas", 
        "Value Proposition Design",
        "Brand Strategy & Messaging"
      ]
    },
    {
      title: "Digital Execution",
      subtitle: "Website & Content Modules",
      modules: [
        "Website Strategy & Architecture",
        "Content Strategy & Calendar",
        "SEO & Organic Growth", 
        "Social Media Strategy"
      ]
    },
    {
      title: "Growth Operations",
      subtitle: "Pipeline & Sales Modules",
      modules: [
        "Outbound Strategy Design",
        "Lead Qualification System",
        "Email Marketing Automation",
        "LinkedIn Sales Strategy"
      ]
    },
    {
      title: "Revenue Systems",
      subtitle: "Optimization & Scale Modules", 
      modules: [
        "Sales Process Optimization",
        "Pipeline Management System",
        "Analytics & Attribution",
        "Performance Optimization"
      ]
    },
    {
      title: "Advanced Growth",
      subtitle: "Partnership & Innovation Modules",
      modules: [
        "Customer Success & Retention",
        "Revenue Operations",
        "Partnership & Channel Strategy",
        "Innovation & Future Planning",
        "Team Development & Training"
      ]
    }
  ];

  return (
    <section className="py-32 bg-neutral-900 text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-24">
          <h2 className="text-4xl lg:text-6xl tracking-tight mb-8">
            Complete Growth Operating System
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-400 leading-relaxed">
            20+ integrated modules covering every aspect of B2B growth - from strategic foundation to revenue optimization
          </p>
        </div>

        <div className="space-y-24">
          {moduleGroups.map((group, groupIndex) => (
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
                    <div key={moduleIndex} className="group flex items-center gap-6 py-4 border-b border-neutral-800 last:border-b-0">
                      <span className="text-2xl font-light text-neutral-600 group-hover:text-white transition-colors w-12">
                        {String(groupIndex * 4 + moduleIndex + 1).padStart(2, '0')}
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
            <div className="text-5xl lg:text-6xl font-light text-white mb-4">20+</div>
            <div className="text-lg text-neutral-400">Integrated Modules</div>
          </div>
          <div>
            <div className="text-5xl lg:text-6xl font-light text-white mb-4">90</div>
            <div className="text-lg text-neutral-400">Days to Results</div>
          </div>
          <div>
            <div className="text-5xl lg:text-6xl font-light text-white mb-4">1,800+</div>
            <div className="text-lg text-neutral-400">Strategic Relationships</div>
          </div>
        </div>
      </div>
    </section>
  );
}