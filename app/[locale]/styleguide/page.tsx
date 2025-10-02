export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-5xl lg:text-7xl font-light mb-4">S1BMW Style Guide</h1>
          <p className="text-xl text-neutral-400">
            Brand colors, typography, and design system reference
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 space-y-24">
        {/* Colors Section */}
        <section>
          <h2 className="text-4xl font-light mb-12 pb-4 border-b border-neutral-200">
            Color Palette
          </h2>

          {/* Primary Brand Colors */}
          <div className="mb-12">
            <h3 className="text-2xl font-medium mb-6">Primary Brand</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="h-32 rounded-2xl bg-primary border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Primary</div>
                  <div className="text-neutral-600">HSL: 0 0% 9%</div>
                  <div className="text-xs text-neutral-500">Near Black (neutral-900)</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-primary-foreground border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Primary Foreground</div>
                  <div className="text-neutral-600">HSL: 0 0% 98%</div>
                  <div className="text-xs text-neutral-500">White on primary</div>
                </div>
              </div>
            </div>
          </div>

          {/* Neutral Colors */}
          <div className="mb-12">
            <h3 className="text-2xl font-medium mb-6">Neutral Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <div className="h-32 rounded-2xl bg-neutral-900 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Neutral 900</div>
                  <div className="text-neutral-600">#171717</div>
                  <div className="text-xs text-neutral-500">Text, Headings</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-neutral-700 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Neutral 700</div>
                  <div className="text-neutral-600">#404040</div>
                  <div className="text-xs text-neutral-500">Body Text</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-neutral-400 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Neutral 400</div>
                  <div className="text-neutral-600">#A3A3A3</div>
                  <div className="text-xs text-neutral-500">Muted Text</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-neutral-200 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Neutral 200</div>
                  <div className="text-neutral-600">#E5E5E5</div>
                  <div className="text-xs text-neutral-500">Borders</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-neutral-50 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Neutral 50</div>
                  <div className="text-neutral-600">#FAFAFA</div>
                  <div className="text-xs text-neutral-500">Backgrounds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-2xl font-medium mb-6">Semantic Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="h-32 rounded-2xl bg-green-500 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Success</div>
                  <div className="text-neutral-600">#22C55E</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-red-500 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Destructive</div>
                  <div className="text-neutral-600">#EF4444</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-blue-500 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Info</div>
                  <div className="text-neutral-600">#3B82F6</div>
                </div>
              </div>
              <div>
                <div className="h-32 rounded-2xl bg-orange-500 border border-neutral-200 mb-3"></div>
                <div className="text-sm">
                  <div className="font-medium">Warning</div>
                  <div className="text-neutral-600">#F97316</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-4xl font-light mb-12 pb-4 border-b border-neutral-200">
            Typography
          </h2>

          <div className="space-y-12">
            {/* Font Family */}
            <div>
              <h3 className="text-2xl font-medium mb-6">Font Families</h3>
              <div className="space-y-4 bg-neutral-50 p-8 rounded-2xl">
                <div>
                  <div className="text-sm text-neutral-600 mb-2">Primary Font</div>
                  <div className="text-3xl font-sans">
                    Geist Sans - The quick brown fox jumps over the lazy dog
                  </div>
                  <div className="text-sm text-neutral-500 mt-2">
                    font-family: var(--font-geist-sans)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-2">Monospace Font</div>
                  <div className="text-2xl font-mono">
                    Geist Mono - The quick brown fox jumps over the lazy dog
                  </div>
                  <div className="text-sm text-neutral-500 mt-2">
                    font-family: var(--font-geist-mono)
                  </div>
                </div>
              </div>
            </div>

            {/* Headings */}
            <div>
              <h3 className="text-2xl font-medium mb-6">Headings</h3>
              <div className="space-y-6">
                <div>
                  <h1 className="text-8xl font-light tracking-tight mb-2">Heading 1</h1>
                  <code className="text-sm text-neutral-600">text-8xl font-light tracking-tight</code>
                </div>
                <div>
                  <h2 className="text-6xl font-light tracking-tight mb-2">Heading 2</h2>
                  <code className="text-sm text-neutral-600">text-6xl font-light tracking-tight</code>
                </div>
                <div>
                  <h3 className="text-4xl font-light tracking-tight mb-2">Heading 3</h3>
                  <code className="text-sm text-neutral-600">text-4xl font-light tracking-tight</code>
                </div>
                <div>
                  <h4 className="text-3xl font-medium mb-2">Heading 4</h4>
                  <code className="text-sm text-neutral-600">text-3xl font-medium</code>
                </div>
                <div>
                  <h5 className="text-2xl font-medium mb-2">Heading 5</h5>
                  <code className="text-sm text-neutral-600">text-2xl font-medium</code>
                </div>
                <div>
                  <h6 className="text-xl font-semibold mb-2">Heading 6</h6>
                  <code className="text-sm text-neutral-600">text-xl font-semibold</code>
                </div>
              </div>
            </div>

            {/* Body Text */}
            <div>
              <h3 className="text-2xl font-medium mb-6">Body Text</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-2xl text-neutral-700 mb-2 leading-relaxed">
                    Large Body Text - Perfect for lead paragraphs and important callouts that need
                    extra emphasis and readability.
                  </p>
                  <code className="text-sm text-neutral-600">
                    text-2xl text-neutral-700 leading-relaxed
                  </code>
                </div>
                <div>
                  <p className="text-xl text-neutral-700 mb-2 leading-relaxed">
                    Extra Large Body - Ideal for subheadings, hero descriptions, and secondary
                    content that deserves more prominence.
                  </p>
                  <code className="text-sm text-neutral-600">
                    text-xl text-neutral-700 leading-relaxed
                  </code>
                </div>
                <div>
                  <p className="text-lg text-neutral-700 mb-2 leading-relaxed">
                    Large Body - Used for bullet points, feature descriptions, and content that
                    needs to be slightly larger than standard body text.
                  </p>
                  <code className="text-sm text-neutral-600">
                    text-lg text-neutral-700 leading-relaxed
                  </code>
                </div>
                <div>
                  <p className="text-base text-neutral-700 mb-2 leading-relaxed">
                    Base Body Text - The standard paragraph text used throughout the application
                    for maximum readability and comfortable reading experience.
                  </p>
                  <code className="text-sm text-neutral-600">
                    text-base text-neutral-700 leading-relaxed
                  </code>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-2">
                    Small Text - Used for captions, labels, metadata, and secondary information
                    that supports primary content.
                  </p>
                  <code className="text-sm text-neutral-600">text-sm text-neutral-600</code>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">
                    Extra Small - For timestamps, fine print, and tertiary information.
                  </p>
                  <code className="text-sm text-neutral-600">text-xs text-neutral-500</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section>
          <h2 className="text-4xl font-light mb-12 pb-4 border-b border-neutral-200">Spacing</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-medium mb-6">Section Spacing</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">py-32</div>
                  <div className="h-8 bg-neutral-900" style={{ width: '128px' }}></div>
                  <div className="text-sm text-neutral-500">Large sections</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">py-24</div>
                  <div className="h-8 bg-neutral-700" style={{ width: '96px' }}></div>
                  <div className="text-sm text-neutral-500">Medium sections</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">py-16</div>
                  <div className="h-8 bg-neutral-500" style={{ width: '64px' }}></div>
                  <div className="text-sm text-neutral-500">Small sections</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">py-12</div>
                  <div className="h-8 bg-neutral-400" style={{ width: '48px' }}></div>
                  <div className="text-sm text-neutral-500">Card padding</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">py-8</div>
                  <div className="h-8 bg-neutral-300" style={{ width: '32px' }}></div>
                  <div className="text-sm text-neutral-500">Compact padding</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-medium mb-6">Gap Spacing</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">gap-16</div>
                  <div className="text-sm text-neutral-500">Large grid gaps</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">gap-12</div>
                  <div className="text-sm text-neutral-500">Medium grid gaps</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">gap-8</div>
                  <div className="text-sm text-neutral-500">Standard grid gaps</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">gap-6</div>
                  <div className="text-sm text-neutral-500">Compact grid gaps</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm text-neutral-600">gap-4</div>
                  <div className="text-sm text-neutral-500">Tight spacing</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UI Components */}
        <section>
          <h2 className="text-4xl font-light mb-12 pb-4 border-b border-neutral-200">
            UI Components
          </h2>
          <div className="space-y-12">
            {/* Buttons */}
            <div>
              <h3 className="text-2xl font-medium mb-6">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
                  Primary Button
                </button>
                <button className="px-8 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                  Secondary Button
                </button>
                <button className="px-8 py-3 bg-neutral-50 text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors">
                  Tertiary Button
                </button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-2xl font-medium mb-6">Cards</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-neutral-200">
                  <h4 className="text-xl font-semibold mb-3">Standard Card</h4>
                  <p className="text-neutral-700 leading-relaxed">
                    White background with subtle border. Used for content cards and sections.
                  </p>
                  <code className="text-xs text-neutral-500 mt-4 block">
                    bg-white p-8 rounded-2xl border border-neutral-200
                  </code>
                </div>
                <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200">
                  <h4 className="text-xl font-semibold mb-3">Muted Card</h4>
                  <p className="text-neutral-700 leading-relaxed">
                    Light gray background. Used for secondary information and outcomes.
                  </p>
                  <code className="text-xs text-neutral-500 mt-4 block">
                    bg-neutral-50 p-8 rounded-2xl border border-neutral-200
                  </code>
                </div>
              </div>
            </div>

            {/* Borders */}
            <div>
              <h3 className="text-2xl font-medium mb-6">Borders & Radius</h3>
              <div className="space-y-4">
                <div className="p-6 border border-neutral-200 rounded-2xl">
                  <code className="text-sm">rounded-2xl (16px) - Cards, Containers</code>
                </div>
                <div className="p-6 border border-neutral-200 rounded-xl">
                  <code className="text-sm">rounded-xl (12px) - Buttons, Inputs</code>
                </div>
                <div className="p-6 border border-neutral-200 rounded-lg">
                  <code className="text-sm">rounded-lg (8px) - Small Elements</code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
