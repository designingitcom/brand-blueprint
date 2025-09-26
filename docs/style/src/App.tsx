import { Navigation } from './components/navigation';
import { HeroSection } from './components/hero-section';
import { ProblemSection } from './components/problem-section';
import { SolutionSection } from './components/solution-section';
import { ModulesSection } from './components/modules-section';
import { FeaturesSection } from './components/features-section';
import { HowItWorksSection } from './components/how-it-works';
import { TestimonialsSection } from './components/testimonials-section';
import { FinalCTA } from './components/final-cta';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        <HeroSection />

        <section id="problems">
          <ProblemSection />
        </section>

        <SolutionSection />

        <section id="modules">
          <ModulesSection />
        </section>

        <section id="features">
          <FeaturesSection />
        </section>

        <section id="how-it-works">
          <HowItWorksSection />
        </section>

        <section id="testimonials">
          <TestimonialsSection />
        </section>

        <FinalCTA />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="mb-6">
                <span className="text-2xl text-white tracking-tight">
                  S1BMW
                </span>
              </div>
              <p className="text-neutral-400 text-lg leading-relaxed">
                The complete Strategy-First Growth OS for B2B businesses.
              </p>
            </div>

            <div>
              <h4 className="text-lg text-white mb-6">Product</h4>
              <div className="space-y-3 text-neutral-400">
                <div className="hover:text-white transition-colors cursor-pointer">
                  Features
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Modules
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Pricing
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Integration
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg text-white mb-6">Company</h4>
              <div className="space-y-3 text-neutral-400">
                <div className="hover:text-white transition-colors cursor-pointer">
                  About
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Blog
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Careers
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Contact
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg text-white mb-6">Support</h4>
              <div className="space-y-3 text-neutral-400">
                <div className="hover:text-white transition-colors cursor-pointer">
                  Help Center
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Documentation
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Community
                </div>
                <div className="hover:text-white transition-colors cursor-pointer">
                  Status
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-lg">
              © 2025 S1BMW. All rights reserved.
            </p>
            <div className="flex gap-8 text-neutral-400 mt-6 md:mt-0">
              <span className="hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-white transition-colors cursor-pointer">
                Terms of Service
              </span>
              <span className="hover:text-white transition-colors cursor-pointer">
                Cookie Policy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
