Business Onboarding Wizard - Comprehensive System Brief

🎯 System Overview

A sophisticated multi-path business onboarding wizard for a strategic marketing operating system. The system guides users through different strategic paths to build comprehensive brand strategy, business positioning, and generates actionable marketing content. Features adaptive confidence scoring, AI-generated segments/personas, and produces a detailed "Strategic Truth Snapshot" report.

---

📋 Core Architecture & Flow

Primary User Journey:
Path Selection Screen → Choose strategic approach
Multi-Step Questionnaire → Gather business intelligence
AI Segment/Persona Selection → Target audience definition
Strategic Truth Snapshot → Comprehensive results report

Three Strategic Paths:

1. Strategic Foundation (Recommended)
   Time: 15 minutes, 19 questions
   Purpose: Complete strategic positioning from ground up
   Features: Full AI intelligence, personalized activations, complete positioning document
   Visual: Purple gradient, Trophy icon, "Recommended" badge

2. Quick Start
   Time: 5 minutes, 5 questions
   Purpose: Fast path to basic activations
   Features: Basic activations, limited personalization, upgrade prompts
   Visual: Yellow-orange gradient, Zap icon, warning indicators

3. Build From Scratch
   Time: 2 minutes to start, then module-based
   Purpose: Complete rebrand/new business approach
   Features: Direct module access, methodical building, locked activations until complete
   Visual: Green gradient, Rocket icon, educational notes

---

🏗️ Technical Implementation Details

Core Technologies:
Framework: React with TypeScript
Styling: Tailwind CSS v4 with custom design tokens
Components: shadcn/ui component library
Icons: Lucide React
State Management: React useState hooks

Key Components Structure:

```
/App.tsx (main component)
/components/ui/ (shadcn components)
/styles/globals.css (Tailwind v4 config)
```

---

📊 Data Architecture

FormData Interface:

```typescript
interface FormData {
  // Path Selection
  selectedPath?: string;

  // Business Basics (Questions 0-7)
  businessName: string;
  website: string;
  industry: string;
  linkedinUrl: string;
  businessType: string;
  yearsInBusiness: string;
  employeeCount: string;
  annualRevenue: string;

  // Services & Products (Questions 8-10)
  services: Service[];
  serviceDelivery: string;
  uniqueValue: string;

  // Competition & Market (Questions 11-13)
  competitors: Competitor[];
  competitiveAdvantage: string;
  marketPosition: string;

  // Target Audience & Personas (Questions 14-15)
  segmentSelections: { [segmentId: string]: 'primary' | 'secondary' | 'none' };
  personaSelections: { [personaId: string]: string };

  // Strategic Questions (Questions 16-44)
  businessDescription: string;
  // ... more strategic fields

  // Confidence Scores
  confidenceScores: { [questionIndex: number]: number };
}
```

---

🎨 UI/UX Design System

Path Selection Screen:
Layout: 3-column grid of path cards on desktop
Visual Hierarchy: Gradient hero, recommended badge, warning indicators
Interactive Elements: Hover effects, gradient overlays, icon animations
Decision Guide: 3-column comparison grid below cards

Main Questionnaire Interface:
Layout: Sidebar navigation + main content area
Responsive: Collapsible sidebar, mobile-optimized
Progress: Percentage bar, time remaining, section completion
Navigation: Previous/Next buttons with confidence scoring between

Color Palette & Gradients:
Purple-Blue: Strategic Foundation (primary recommended)
Yellow-Orange: Quick Start (warning undertones)
Green-Emerald: Build From Scratch (growth/new)
Blue: Information/guidance sections
Amber: Warnings/cautions
Red: Errors/important notices

---

⚙️ Confidence Scoring System

Implementation Details:
Scale: 1-5 numeric + N/A option
Placement: Between Previous/Next buttons in navigation
Height: Matches button height (h-10) with reduced padding
Logic: Only appears for subjective questions (starting question 4+)
Exclusions: Factual questions (name, website, industry, LinkedIn, selections, results)

Scoring Logic:

```typescript
// Confidence levels
1-2: "Guessing or very uncertain" (Low/Red)
3: "Somewhat confident, could use more research" (Medium/Amber)
4-5: "Very confident, well-researched answer" (High/Green)
N/A: "Question doesn't apply to my situation" (Gray)
```

Validation:
Required: Next button disabled until confidence provided for applicable questions
Calculations: Overall confidence excludes N/A responses
Display: Tooltips explain purpose and scoring meanings

---

📖 Question Guidance System

Tabbed Interface:
Tips Tab (💡): Strategic advice and best practices
Examples Tab (✓): Real-world examples in quotes
ELI5 Tab (🧸): Simple explanations for complex concepts

Interactive Behavior:
Toggle Logic: Same tab click hides content, different tab shows new content
Visual Design: Slate background, colored icons, organized lists
Content Structure: Bullet points with icons, easy scanning

Implementation Pattern:

```tsx
<QuestionGuidance
  questionNumber={4}
  tips={['Strategic advice...', 'Best practices...']}
  examples={['Real example 1', 'Real example 2']}
  simpleExplanation={['Simple explanation 1', 'Simple explanation 2']}
/>
```

---

🎯 AI-Generated Content System

Segment Generation (Question 14):
Mock Data: 4 pre-defined business segments
Characteristics: Employee count, market traits, business characteristics
Selection Logic: Primary/Secondary/None for each segment
Validation: Only one primary segment allowed

Persona Generation (Question 15):
Mock Data: 4 detailed customer personas
Components: Name, title, demographics, pain points, goals
Assignment: Map personas to selected segments
Dependency: Requires segments selected first

Content Structure:

```typescript
interface Segment {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  marketSize: 'Large' | 'Medium' | 'Small';
}

interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
}
```

---

📄 Strategic Truth Snapshot (Results Page)

Comprehensive Report Sections:

1. Brand Identity Core
   Brand Essence: Generated positioning statement
   Mission & Vision: Auto-generated from user inputs
   Core Values: Standard business values grid
   Unique Value Proposition: User's unique value formatted

2. Customer Intelligence
   Primary ICP Profile: Selected segment with characteristics
   Customer Personas: Assigned personas with pain points/goals
   Segment Analysis: Market size and targeting rationale

3. Core Positioning Framework ("Why Should They Choose Us?")
   Central Positioning Statement: "For [segment] who need [goal], we are the only [category] that [unique value]"
   Four-Quadrant Analysis:
   WHY: Customer motivations (pain points + desired outcomes)
   THEY: Ideal customer profile (segment + persona details)
   US: Company identity (name, industry, years, description, approach, delivery)
   COMPETITION: Competitors + advantages + market position
   Validation Checklist: 6-point positioning verification

4. Strategic Messaging Framework
   Primary Value Proposition: Core marketing message
   Supporting Messages: Key differentiators
   Elevator Pitches: 30-second and 2-minute versions
   Content Themes: 7 suggested content categories

5. Ready-to-Use Assets
   Homepage Hero Content: Headline, subheading, CTA
   Content Themes: Actionable content categories

6. Implementation Roadmap
   Week 1-2 (Quick Wins): Website updates, LinkedIn refresh, email signatures, pitch practice
   Month 1-2 (Foundation): Content launch, sales materials, team training, persona outreach
   Month 3+ (Scale & Measure): Tracking, feedback, optimization, expansion
   Success Metrics: Marketing metrics + business impact KPIs

7. Confidence Analysis & Recommendations (Conditional)
   Overall Confidence Score: Average of all responses (excludes N/A)
   Confidence Breakdown: Question-by-question scoring
   Recommended Actions: Based on confidence levels:
   High (4+): Ready for activations
   Medium (3-4): Consider additional modules
   Low (<3): Foundation strengthening needed

---

🧭 Navigation & Progress System

Section-Based Navigation:
7 Main Sections: Business Basics → Services → Competition → Audience → Personas → Strategy → Results
Question Distribution: 8+3+3+1+1+29+1 = 46 total questions
Visual Progress: Percentage bar, questions remaining, time estimates
Jump Navigation: Click sections to skip (with appropriate warnings)

Sidebar Design:
Collapsible: Toggle button for space efficiency
Section Icons: Lucide icons for each section
Progress Indicators: Completed/current/upcoming states
Responsive: Hidden on mobile, overlay behavior

Navigation Controls:
Previous/Next: Always present, appropriate disabling
Path Selection Return: Back button to choose different path
Confidence Integration: Blocks progression until scored
Validation: Form completion requirements per question

---

📱 Responsive Design Requirements

Desktop (lg+):
Layout: Sidebar + main content grid
Sidebar: Full navigation with descriptions
Cards: Multi-column grids for paths/segments/personas
Content: Full question guidance tabs

Tablet (md):
Layout: Simplified grid layouts
Sidebar: Collapsed by default
Cards: 2-column layouts where appropriate
Content: Maintained tab functionality

Mobile (sm):
Layout: Single column, full-width
Sidebar: Hidden/overlay behavior
Cards: Stacked single column
Navigation: Simplified, touch-optimized

---

🔧 Key Interactive Features

Dynamic Form Management:
Services Array: Add/remove multiple services with name, description, URL
Competitors Array: Add/remove multiple competitors with details
Real-time Validation: Required fields, format checking
Auto-save Behavior: State persistence during session

Advanced UI Patterns:
Radio Groups: Business type selection with descriptions
Card Grids: Years in business with visual selection
Dropdown Assignments: Persona-to-segment mapping
Conditional Content: Confidence scoring visibility logic

Toast & Feedback:
Validation Messages: Clear error/success states
Progress Feedback: Visual completion indicators
Loading States: Smooth transitions between questions
Accessibility: Proper focus management, screen reader support

---

💡 Smart Logic & Algorithms

Confidence Score Processing:

```typescript
// Only show for applicable questions
const isConfidenceApplicable = (questionIndex: number) => {
  const factualQuestions = [0, 1, 2, 3, 14, 15, 45]; // exclusion list
  return !factualQuestions.includes(questionIndex);
};

// Calculate overall confidence
const getOverallConfidence = () => {
  const scores = Object.values(confidenceScores).filter(score => score > 0);
  return (
    Math.round(
      (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
    ) / 10
  );
};
```

Content Generation Logic:
Positioning Statement: Template with user data insertion
Hero Content: Dynamic headline/subheading generation
Messaging Framework: Context-aware content suggestions
Implementation Roadmap: Confidence-based recommendations

---

🎨 Visual Design Specifications

Typography System:
Headers: Medium weight, appropriate sizing hierarchy
Body Text: Normal weight, 1.5 line height
Labels: Medium weight for form fields
Buttons: Medium weight for actions

Spacing & Layout:
Grid Systems: CSS Grid for major layouts
Card Padding: Consistent 4-6 spacing units
Button Heights: h-10 standard, matching confidence component
Border Radius: Consistent rounded corners via design tokens

Color Usage:
Primary Actions: Purple gradients for recommended paths
Warning States: Amber for cautions and limitations
Success States: Green for completions and confirmations
Information: Blue for guidance and tips
Neutral: Gray scales for secondary content

---

📋 Implementation Checklist

Core Functionality:
[ ] Three-path selection with distinct characteristics
[ ] 46-question progressive form with sections
[ ] Confidence scoring with 1-5 + N/A scale
[ ] AI segment/persona selection interfaces
[ ] Complete Strategic Truth Snapshot generation
[ ] Responsive design across all breakpoints

Advanced Features:
[ ] Collapsible sidebar navigation
[ ] Question guidance with tabbed content
[ ] Dynamic arrays for services/competitors
[ ] Confidence-based recommendations
[ ] Progress tracking and section jumping
[ ] Mobile-optimized interactions

Polish & UX:
[ ] Smooth transitions between questions
[ ] Proper loading and validation states
[ ] Accessibility compliance
[ ] Error handling and recovery
[ ] Performance optimization
[ ] Cross-browser compatibility

---

🚀 Success Metrics & Outcomes

The completed system should enable users to:

Choose appropriate strategic path based on business needs
Complete comprehensive business profiling through guided questions
Express confidence levels for strategic self-assessment
Select target segments and personas from AI suggestions
Generate professional strategic positioning report
Receive actionable implementation guidance with timelines
Access ready-to-use marketing assets immediately
Understand next steps based on confidence analysis

The system represents a sophisticated onboarding experience that transforms complex strategic consulting into an accessible, interactive digital experience.
