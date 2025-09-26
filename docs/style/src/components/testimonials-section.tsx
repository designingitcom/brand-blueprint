import { ImageWithFallback } from './figma/ImageWithFallback';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "S1BMW delivered what our $75K agency couldn't - a strategy that actually connects to execution. Our conversion rates improved 340% because everything finally made sense together.",
      author: 'Sarah Chen',
      role: 'CMO at TechFlow',
      image:
        'https://images.unsplash.com/photo-1522199899308-2eef382e2158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzfGVufDF8fHx8MTc1ODc4NjU1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      quote:
        "The outbound orchestration is incredible. We're booking 5x more meetings because our messaging is consistently on-brand and strategically aligned across all channels.",
      author: 'Marcus Rodriguez',
      role: 'Founder of GrowthLab',
      image:
        'https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwbWFufGVufDF8fHx8MTc1ODc4NjU1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      quote:
        "Finally, one system that handles everything from brand strategy to pipeline management. We've eliminated 12 tools and our team is 400% more efficient.",
      author: 'Emma Thompson',
      role: 'Agency Owner',
      image:
        'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODczMDgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  return (
    <section className="py-32 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-24">
          <h2 className="text-4xl lg:text-6xl tracking-tight text-neutral-900 mb-8">
            What Industry Leaders Are Saying
          </h2>
          <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed">
            Real results from businesses that transformed their growth with
            S1BMW
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="bg-white p-10 rounded-2xl border border-neutral-200">
                {/* Quote */}
                <blockquote className="text-lg lg:text-xl leading-relaxed mb-8 text-neutral-700">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-lg text-neutral-900">
                      {testimonial.author}
                    </div>
                    <div className="text-neutral-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 text-center">
          <div>
            <div className="text-4xl lg:text-5xl font-light text-neutral-900 mb-4">
              340%
            </div>
            <div className="text-lg text-neutral-600">
              Conversion Rate Increase
            </div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-light text-neutral-900 mb-4">
              5x
            </div>
            <div className="text-lg text-neutral-600">More Meetings Booked</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-light text-neutral-900 mb-4">
              12
            </div>
            <div className="text-lg text-neutral-600">Tools Eliminated</div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-light text-neutral-900 mb-4">
              400%
            </div>
            <div className="text-lg text-neutral-600">Team Efficiency Gain</div>
          </div>
        </div>
      </div>
    </section>
  );
}
