import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { ProblemSection } from '@/components/landing/problem-section';
import { SolutionSection } from '@/components/landing/solution-section';
import { ModulesSection } from '@/components/landing/modules-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { FinalCTA } from '@/components/landing/final-cta';
import { Navigation } from '@/components/landing/navigation';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <ModulesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FinalCTA />
    </div>
  );
}