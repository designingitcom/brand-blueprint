import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-32 bg-neutral-900 text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl lg:text-7xl tracking-tight mb-12">
            Ready to Transform Your Entire Growth Engine?
          </h2>
          
          <p className="text-xl lg:text-2xl mb-16 text-neutral-400 leading-relaxed">
            Join hundreds of businesses that have revolutionized their marketing with a strategy-first Growth OS that actually delivers results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-300"
            >
              Start Your Growth OS
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-12 py-6 text-lg border border-neutral-700 text-white hover:bg-neutral-800 rounded-lg transition-all duration-300"
            >
              Book Strategy Session
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-neutral-800">
            <p className="text-neutral-400 text-lg mb-6">Trusted by 500+ growing businesses</p>
            <div className="flex justify-center items-center gap-12 text-neutral-500">
              <div>✓ No Long-term Contracts</div>
              <div>✓ 30-Day Money Back</div>
              <div>✓ Expert Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Large background number */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] font-light text-neutral-800/20 select-none pointer-events-none hidden xl:block">
        90
      </div>
    </section>
  );
}