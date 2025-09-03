S1BMW - Strategy First Brand+Marketing+Website Platform
Complete Product Requirements Document (PRD)
Table of Contents
Executive Summary
Problem Statement
Solution Overview
User Personas
Technical Architecture
Functional Requirements
API Specifications
Database Schema
Implementation Plan
Success Metrics
1. Executive Summary
Vision and Value Proposition

The S1BMW (Strategy First Brand+Marketing+Website) System is an intelligent business development platform that guides companies through one seamless journey from brand strategy to fully implemented website and marketing systems. It combines AI-powered workshops with agency expertise to deliver everything from foundational positioning and visual identity to website copywriting, design specifications, and tactical marketing deliverables - all while bridging directly into the agency's internal development processes for actual implementation.

Unlike traditional brand development tools that create isolated documents, S1BMW creates an intelligent knowledge graph where 57+ foundational questions inform every downstream decision. This Strategy First Approach ensures that brand personality, messaging, website copy, and marketing campaigns all maintain strategic consistency. The platform transforms static questionnaires into dynamic, AI-augmented workshops where three stakeholders collaborate: agency specialists, client stakeholders, and AI assistance that gets smarter with each answer.

The platform addresses the fundamental waste in the industry: businesses invest significant time and money in brand foundations that never get properly utilized because existing solutions stop at strategy documents instead of bridging into actual implementation and ongoing execution. S1BMW creates a continuous workflow from brand foundation through website launch and ongoing marketing execution, eliminating the disconnection between strategic thinking and tactical implementation.

Key Objectives

Objective	Target	Timeline
Monthly Recurring Revenue	$10M ARR	24 months
Agency Customer Acquisition	500 agencies	18 months
User Activation Rate	85% complete M1 within 7 days	6 months
AI Utilization	70% of questions use AI assistance	12 months
Module Completion	Average 8+ modules per project	9 months
Time to Value	< 3 days from signup to brand portal	6 months
Expected Impact and Success Criteria

Market Impact: Transform the $50B+ brand consulting market by providing agency-level strategic depth at software scale, reducing traditional project timelines from 12-16 weeks to 4-6 weeks while maintaining quality.

Success Criteria: - Customer Satisfaction: NPS > 50, with specific focus on "strategic consistency" and "implementation bridge" feedback - Business Viability: 40% gross margins, CAC payback < 12 months - Product-Market Fit: 80%+ of agencies report S1BMW has become essential to their workflow - Technical Performance: 99.9% uptime, < 2 second page loads, < 5 second AI response times

2. Problem Statement
Current Market Situation

The global brand strategy and development market is valued at over $50 billion annually, yet it remains fragmented and inefficient. Current solutions fall into three categories:

High-End Agencies ($50K-$200K+ projects): - Manual, linear questionnaires taking 40-60 hours to process - 12-16 week timelines with multiple handoffs - Deliverables stop at strategy documents - No systematic way to bridge into implementation - Inconsistent quality across different strategists

DIY Brand Tools ($29-$99/month): - Shallow questionnaires lacking strategic depth - No interconnection between brand elements - Generic templates without customization - No AI assistance or intelligent suggestions - No implementation pathway

Fragmented Solution Providers: - Separate vendors for strategy, design, website, marketing - No strategic consistency across touchpoints - Multiple handoffs causing strategic dilution - High coordination costs and timeline delays

User Pain Points with Real Scenarios

Agency Strategist Pain Point: Sarah, Creative Director at a 25-person agency, spends 3 weeks just processing client discovery questionnaires. "We send clients a 40-page PDF questionnaire, they fill it out inconsistently, then I spend days trying to synthesize scattered answers into coherent strategy. By the time we present the brand strategy, the client has forgotten why they answered certain questions. Then we hand it off to design and web teams who interpret the strategy differently than I intended."

In-House Marketing Director Pain Point: Mike, CMO at a Series B SaaS company, tried hiring a brand agency but the process stalled. "We paid $80K for a brand strategy that resulted in a beautiful PDF document that sits in our shared drive. Our design team doesn't know how to translate 'approachable yet authoritative' into actual website copy. Our demand gen team creates campaigns that don't reflect our brand personality because there's no systematic way to apply the strategy to tactical execution."

Business Owner Pain Point: Lisa, founder of a growing professional services firm, needs to professionalize her brand but can't afford agency prices. "DIY tools like Canva or Looka help with logos but don't address strategic positioning. I know my brand needs to evolve, but I don't have $50K for an agency or the expertise to do strategic brand work myself. I need something between a template and a consultant."

Opportunity Size and Cost of Inaction

Total Addressable Market: $50B+ global brand consulting market Serviceable Addressable Market: $8B (agencies and growth companies in English/German markets) Serviceable Obtainable Market: $800M (mid-market agencies and companies willing to adopt SaaS solutions)

Cost of Inaction for Users: - Agencies: 40-60 hours of manual work per project, 3-4x longer timelines, inconsistent deliverable quality - Companies: $50K-$200K agency costs or settling for shallow DIY solutions, brand inconsistency across channels - Market: Billions in waste from disconnected brand investments that don't translate to implementation

Cost of Delayed Market Entry: - First-mover advantage in AI-powered brand development (6-12 month window) - Risk of larger players (Adobe, HubSpot, agencies) building similar solutions - Growing market demand for integrated brand-to-implementation workflows

3. Solution Overview
How the Solution Works

S1BMW operates as an intelligent workshop system that transforms traditional brand development through four core innovations:

1. Strategy First Knowledge Graph The foundation of S1BMW is a manually crafted knowledge graph connecting 1,800+ question relationships across 21 modules. Users begin with M1 (57+ foundational questions) that creates prerequisite context for all downstream modules. When a user answers "What's your primary business challenge?" in M1, this feeds forward to inform brand positioning questions in M4, customer journey mapping in M9, and website copywriting in M15. Every answer makes the system smarter and ensures strategic consistency.

2. Intelligent Six-Part Question Framework Each question uses a six-part framework designed to make complex strategic concepts accessible: - Definition: Clear explanation in plain terms - Examples: Real-world illustrations - Demonstrations: Visual/interactive elements - Why It Matters: Downstream impact explanation - Simple Terms: Kid-friendly restatement - Confidence Calibration: User certainty rating (1-10 scale)

This framework transforms questions like "Define your brand archetype" into engaging, educational experiences that guide users to strategic answers.

3. Three-Way AI Collaboration AI assistance is available on-demand for every question but never replaces human judgment. The AI analyzes: - All previous answers within the project - Mapped prerequisite questions (highest weight) - Industry patterns and benchmarks - Similar company data (privacy-compliant)

The AI provides multiple answer suggestions, explains reasoning, and learns from user selections to improve future recommendations.

4. Implementation Bridge Architecture Unlike traditional tools that stop at strategy documents, S1BMW creates actual deliverables: - Interactive Brand Portal: Living brand guide with 20 components across 5 sections - Design Specifications: Detailed briefs for visual identity work - Website Requirements: Content architecture, copywriting, and technical specs - Marketing Activations: On-demand tactical projects using foundation data - Agency SOP Integration: Direct connection to internal workflows and handoffs

Technical Approach and Key Decisions

Architecture Decision: Next.js + Supabase We chose Next.js 15 with Supabase for rapid development and built-in real-time capabilities. This allows for: - Server-side rendering for SEO and performance - Built-in authentication and row-level security - Real-time collaboration without custom WebSocket infrastructure - Integrated storage for brand assets and exports

AI Integration Decision: OpenRouter Gateway We use OpenRouter as the single LLM gateway rather than direct provider APIs for simplified operations and model flexibility. This approach provides: - Single API key management across all AI features - Easy model switching without code changes (GPT-4, Claude, Llama, etc.) - Consistent usage tracking and cost management - Unified rate limiting and error handling

AI Integration Pattern: ```typescript // Environment Configuration AIROUTER=direct|n8n OPENROUTERAPIKEY=skorxxxxx N8NWEBHOOK_URL=https://n8n.brandblueprint.ai/webhook/ai-run

// Server Action Routing export async function runAI(payload: { messages: any; model?: string; jobId?: string; }) { if (process.env.AIROUTER === "n8n") { // Complex workflows: enqueue to n8n const response = await fetch(process.env.N8NWEBHOOKURL, { method: "POST", body: JSON.stringify({ jobid: payload.jobId, tenant: getTenantId(), user: getUserId(), model: payload.model ?? "openai/gpt-4o", messages: payload.messages }) }); return { queued: true }; } else { // Simple suggestions: direct to OpenRouter const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: Bearer ${process.env.OPENROUTER_API_KEY}, "Content-Type": "application/json", "HTTP-Referer": process.env.APP_URL, "X-Title": "Brandblueprint.ai" }, body: JSON.stringify({ model: payload.model ?? "openai/gpt-4o", user: ${getTenantId()}|${getUserId()}, messages: payload.messages, stream: false, usage: { include: true } }) });

const result = await response.json();
// Track usage in database
await trackAIUsage(result.usage, payload.model);
return result;
} } ```

Usage Patterns: - Direct OpenRouter (80% of calls): Question suggestions, content generation, simple analysis - n8n + OpenRouter (20% of calls): Multi-step workflows like competitor analysis, website audits, complex report generation

Data Flow: 1. User requests AI assistance on question 2. Server action analyzes complexity and routes appropriately 3. For direct calls: OpenRouter API → database logging → real-time UI update 4. For complex workflows: n8n orchestration → multiple API calls → file storage → database updates → real-time notifications

Data Architecture Decision: Relational + JSONB PostgreSQL with structured tables for core entities and JSONB for flexible content: - Ensures data integrity for question relationships - Flexibility for various question types and answers - Efficient querying for AI context retrieval - Scalable for complex business logic

Core Differentiators

Feature	S1BMW	Traditional Agencies	DIY Tools
Strategic Consistency	Knowledge graph ensures consistency	Manual synthesis, prone to gaps	No strategic framework
AI Intelligence	Context-aware suggestions	Human-only insights	Generic templates
Implementation Bridge	Creates actual deliverables	Stops at strategy documents	No implementation path
Collaboration	Real-time three-way collaboration	Email-based back-and-forth	Individual work only
Time to Value	Days to weeks	Months	Minutes but shallow
Cost	$200-$2000/month	$50K-$200K per project	$30-$100/month
Customization	Intelligent adaptation	Fully custom	Template-based
4. User Personas
Persona 1: Sarah Chen - Agency Creative Director

Demographics: - Age: 34, San Francisco Bay Area - Role: Creative Director at 45-person brand agency - Experience: 12 years in branding, 6 in leadership - Education: BFA in Graphic Design, MBA - Technical Proficiency: High (Adobe Creative Suite expert, comfortable with SaaS tools)

Daily Workflow: - Reviews 3-4 client projects in various stages - Leads strategy workshops and client presentations - Manages team of 6 designers and 2 strategists - Balances creative vision with business objectives

Pain Points: "Our discovery phase is a bottleneck. Clients take weeks to return questionnaires, then I spend days synthesizing 40 pages of scattered answers. By the time we present strategy, momentum is lost. Worse, when we hand off to design and web teams, they interpret our strategy differently, and the final deliverables don't reflect our strategic thinking."

Goals: - Reduce discovery phase from 6 weeks to 2 weeks - Ensure strategic consistency across all deliverables - Improve client engagement during discovery - Create systematic handoffs to internal teams

Quote: "I need a system that helps clients think through strategy systematically, then creates clear specifications that my team can execute flawlessly."

S1BMW Usage Pattern: - Creates client businesses and invites stakeholders - Guides clients through M1-M4 foundation modules - Uses AI assistance to suggest strategic options - Reviews client answers and provides expert input - Exports deliverables for team handoffs

Persona 2: Mike Rodriguez - In-House Marketing Director

Demographics: - Age: 41, Austin, Texas - Role: VP of Marketing at Series B SaaS company (200 employees) - Experience: 15 years in B2B marketing, 3 years in current role - Education: MBA in Marketing - Technical Proficiency: Medium-High (marketing automation expert, learning design tools)

Daily Workflow: - Manages marketing team of 8 people - Oversees demand generation, content, and brand - Reports to CEO on marketing performance - Coordinates with product, sales, and customer success

Pain Points: "We outgrew our startup branding but agencies want $80K and 4 months for a rebrand. DIY tools like Canva help with assets but don't address strategic positioning. Our website copy, ads, and content don't feel cohesive because we lack a strategic foundation. I need agency-level strategy but want to maintain control and timeline."

Goals: - Develop professional brand strategy internally - Ensure brand consistency across all marketing channels - Create systematic approach to brand application - Build team's strategic capabilities

Quote: "I want to do the strategic thinking with my team, but I need guidance and frameworks. Give me the tools agencies use, but let me drive the process."

S1BMW Usage Pattern: - Creates single business for company brand - Works through comprehensive module sequence (M1-M19) - Involves team members in different modules - Uses AI for external perspective on internal decisions - Exports brand guide for team reference and vendor briefs

Persona 3: David Kim - Business Owner/Founder

Demographics: - Age: 38, Denver, Colorado - Role: Founder/CEO of professional services firm (25 employees) - Experience: 10 years building business, former consultant - Education: MBA from top program - Technical Proficiency: Medium (comfortable with business software, learning curve on design)

Daily Workflow: - Strategic planning and business development - Client relationship management - Team leadership and hiring - Financial oversight and planning

Pain Points: "Our brand worked when we were 5 people, but now we're 25 and growing. Clients expect more polish and consistency. We can't afford a $100K agency rebrand, and our attempts at DIY branding feel amateurish. I need something that helps us think through positioning systematically but doesn't require design expertise."

Goals: - Professionalize brand to match business growth - Create consistency across client touchpoints - Build internal capability for brand management - Prepare for next growth phase (Series A or acquisition)

Quote: "I know our positioning needs to evolve, but I don't have the expertise to do strategic brand work myself. I need something between a template and a consultant."

S1BMW Usage Pattern: - Uses Startup or Growth path depending on complexity - Involves key stakeholders (COO, head of sales) in select modules - Relies heavily on AI assistance for expert guidance - Focuses on modules that directly impact business development - Uses brand portal for client presentations and team alignment

5. Technical Architecture
Complete Technology Stack

Frontend + Backend: Next.js 15 (App Router + Server Actions)
Database: Supabase PostgreSQL + RLS + Realtime
Auth: Supabase Auth (@supabase/ssr only)
Storage: Supabase Storage
AI: OpenRouter API (Single LLM gateway)
Web Scraping: n8n workflows (external)
Testing: Playwright
PDF: @react-pdf/renderer
Background Jobs: Vercel Cron + Server Actions
Email: Resend
Styling: Tailwind CSS + shadcn/ui
Deployment: Vercel
Complete Package.json

{
  "name": "s1bmw-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "supabase": "supabase",
    "db:reset": "supabase db reset",
    "db:push": "supabase db push",
    "types": "supabase gen types typescript --local > types/database.ts"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",

    "@supabase/supabase-js": "^2.38.5",
    "@supabase/ssr": "^0.0.10",

    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",

    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.303.0",

    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-badge": "^1.0.0",

    "@react-pdf/renderer": "^3.1.14",

    "resend": "^2.1.0",
    "@react-email/components": "^0.0.12",

    "next-intl": "^3.4.0",

    "date-fns": "^3.0.6",
    "uuid": "^9.0.1",
    "slugify": "^1.6.6",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@types/uuid": "^9.0.7",
    "@types/lodash": "^4.14.202",
    "@playwright/test": "^1.40.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "supabase": "^1.123.4"
  }
}
User Roles and Permissions

Role	Access Level	Core Permissions	Business Management	AI & Collaboration
Super Admin	Platform-wide	View all businesses, manage system modules/questions, platform analytics	Create any business, manage all users	Full AI access, system-wide usage analytics
Business Owner	Full business access	All project operations, team management, billing	Create/delete business, manage all memberships	Full AI access, usage monitoring
Business Admin	Full business access	All project operations, invite users (except other admins)	Edit business settings, view billing	Full AI access, team usage tracking
Project Manager	Project-scoped	Create/edit assigned projects, manage project team, approve responses	View business info, invite project members	AI access for assigned projects
Contributor	Project-scoped	Edit responses, use AI assistance, collaborate in real-time	View project team, suggest new members	AI access for assigned questions
Client	Limited project access	Answer assigned questions, view brand portal, comment/collaborate	View project info only	Basic AI assistance, no usage analytics
Viewer	Read-only	View completed responses, brand portal, project progress	View business/project info	No AI access, read-only collaboration
Data Flow and Integration Specifications

User Interaction Flow: 1. User accesses question through Next.js App Router 2. Question component fetches data via Server Action 3. Answer submission triggers database update via Supabase 4. Real-time subscription notifies other users of changes 5. AI assistance requests processed server-side with context 6. Question mapping graph determines next available questions

AI Context Management: 1. Question relationships stored in question_relationships table 2. AI prompts weighted by relationship type and user confidence 3. Project context maintained in ai_contexts table with embeddings 4. RAG system retrieves relevant context for large projects 5. AI responses cached for 24 hours to optimize costs

Multi-Tenant Architecture: 1. Row Level Security policies based on membership table 2. All data scoped by tenant_id inherited from business 3. Real-time subscriptions filtered by user access 4. File storage organized by tenant hierarchy

Scalability and Security Considerations

Scalability: - Database: PostgreSQL optimized for OLTP workloads, read replicas for analytics - Caching: Redis layer for session data and AI response caching - File Storage: Supabase Storage with CDN for global asset delivery - Compute: Serverless functions auto-scale based on demand - Rate Limiting: Built-in protection against abuse and AI cost overruns

Security: - Authentication: Supabase Auth with MFA support - Authorization: Row Level Security for multi-tenant data isolation - Data Protection: Encryption at rest and in transit - API Security: Rate limiting, CORS policies, input validation - AI Safety: Content filtering, prompt injection protection - Compliance: GDPR-ready data handling, audit logs

Performance: - Frontend: Server-side rendering, code splitting, image optimization - Database: Proper indexing, query optimization, connection pooling - AI Integration: Parallel processing, response caching, selective usage - Monitoring: Real-time performance tracking, error alerting

6. Functional Requirements
P0 Features (Must Have - MVP)

User Story 1: User Registration and Onboarding

As a new user
I want to create an account and set up my first business and project
So that I can start working on my brand strategy

Acceptance Criteria: - User can sign up with email and password - Email verification required before access - Onboarding wizard guides through business setup - First project created automatically - User can invite team members during onboarding - Dashboard accessible immediately after setup

Implementation Details: - Supabase Auth integration with email confirmation - Multi-step onboarding form with progress indicator - Automatic M1 module assignment to first project - Role-based access control setup

User Story 2: M1 Foundation Questions Workshop

As a business stakeholder
I want to work through the 57 foundational questions with AI assistance
So that I create a comprehensive strategic foundation

Acceptance Criteria: - All 57 questions accessible with 6-part framework - Interactive question types supported (text, dropdown, sliders) - AI assistance available on-demand for each question - Confidence calibration for every answer - Progress tracking and ability to save drafts - Real-time collaboration with team members

Implementation Details: - Dynamic question rendering based on type - AI context includes all previous answers plus mapped prerequisites - Confidence scoring affects AI suggestion weighting - Auto-save functionality every 30 seconds

User Story 3: Two-Panel Workshop Interface

As a user answering strategic questions
I want separate workspace and AI assistance panels
So that I can work independently or get AI help when needed

Acceptance Criteria: - Left panel for user workspace (multiple answer attempts) - Right panel for AI assistant (initially empty) - AI help triggered manually by user request - User can approve/unapprove answers at any time - AI suggestions based on user's current answers - Real-time updates between panels

Implementation Details: - Two separate data tables: user_answers and ai_conversations - OpenRouter integration for AI suggestions - Context-aware prompts using question mapping graph

User Story 4: Brand Portal Generation

As a business owner
I want to see my brand strategy compiled into a professional brand guide
So that I can review my brand foundation and share with stakeholders

Acceptance Criteria: - Brand portal updates in real-time as questions are answered - 20 components across 5 sections properly populated - Export functionality for PDF and Markdown formats - Shareable links with access control - Version history tracking

Implementation Details: - Server-side brand guide generation using approved responses - PDF generation using @react-pdf/renderer - File storage in Supabase Storage with proper permissions

P1 Features (Should Have - Enhanced Experience)

User Story 5: AI-Powered Question Assistance

As a user answering strategic questions
I want intelligent suggestions based on my previous answers
So that I can make informed decisions with expert guidance

Acceptance Criteria: - AI suggestions provided for every question type - Context awareness using question mapping relationships - Multiple suggestion options with explanations - Learning from user selections to improve future suggestions - Clear indication when AI confidence is low

Implementation Details: - OpenRouter API integration with custom prompts - Question relationship graph processing for context - Response caching to optimize API costs - A/B testing framework for prompt optimization

User Story 6: Module Dependencies and Progression

As a user working through strategy modules
I want guided progression based on completed prerequisites
So that I follow a logical sequence and build comprehensive strategy

Acceptance Criteria: - Module unlocking based on prerequisite completion - Clear indication of required vs. optional modules - Progress visualization across entire strategy path - Ability to skip non-essential questions with warnings - Smart recommendations for next modules

Implementation Details: - Database constraints ensuring prerequisite completion - Dynamic UI showing available modules - Progress calculation algorithms - Recommendation engine based on business type and goals

User Story 7: Real-Time Collaboration

As a team member working on brand strategy
I want to collaborate with colleagues in real-time
So that we can build strategy together efficiently

Acceptance Criteria: - Multiple users can work on same project simultaneously - Live cursor positions and editing indicators - Comment and discussion system on questions - Role-based permissions for viewing and editing - Activity feed showing team progress

Implementation Details: - Supabase Realtime for live updates - Optimistic UI updates with conflict resolution - WebSocket connections for live collaboration features

P2 Features (Nice to Have - Advanced Functionality)

User Story 8: Advanced Question Types

As a strategic thinking facilitator
I want interactive question formats beyond text input
So that I can engage users and gather richer strategic insights

Acceptance Criteria: - Tone sliders with descriptive anchors - Card sorting for priority ranking - Moodboard selection from curated options - Scenario branching based on previous answers - Multi-dimensional comparison matrices

User Story 9: Competitor and Website Analysis

As a brand strategist
I want automated analysis of competitors and client websites
So that I can provide data-driven strategic recommendations

Acceptance Criteria: - URL input triggers automated analysis via n8n workflows - Comprehensive reports on positioning, messaging, and SEO - Competitive comparison matrices - Integration with strategic question context - Regular updates and monitoring

User Story 10: Activation Marketplace

As a user with completed brand foundation
I want to create tactical marketing deliverables
So that I can execute on my brand strategy immediately

Acceptance Criteria: - Access unlocked after foundation modules complete - Browse activations by focus area (SEO, content, ads) - AI-generated briefs using foundation data - Deliverable creation and export - Integration with brand guidelines

User Flow Descriptions

Primary User Flow - First-Time User: Landing Page → Sign Up → Email Verification → Onboarding Wizard → Business Setup → Project Creation → Strategy Path Selection → M1 Questions → AI Assistance → Answer Completion → Brand Portal Preview → Module Progression → Export Deliverables

Returning User Flow: Login → Dashboard → Project Selection → Continue Questions → Collaborate with Team → Review Brand Portal → Access Advanced Modules → Generate Activations

Agency Flow: Agency Registration → Client Business Creation → Team Invitations → Multi-Project Management → Client Collaboration → Deliverable Generation → Internal Handoffs

7. API Specifications
Authentication Endpoints

// User Authentication
POST /auth/signup
{
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name?: string;
}
Response: { user: User; session: Session }

POST /auth/signin
{
  email: string;
  password: string;
}
Response: { user: User; session: Session }

GET /auth/user
Headers: { Authorization: "Bearer <token>" }
Response: { user: User; business: Business; role: string }
Business and Project Management

// Business Operations
GET /api/businesses
Response: Business[]

POST /api/businesses
{
  name: string;
  type: 'agency' | 'in_house';
  industry?: string;
  website_url?: string;
}
Response: Business

// Project Operations
GET /api/businesses/:businessId/projects
Response: Project[]

POST /api/businesses/:businessId/projects
{
  name: string;
  description?: string;
  strategy_path: string;
}
Response: Project

GET /api/projects/:projectId
Response: {
  project: Project;
  modules: Module[];
  progress: ProjectProgress;
}
Question and Response Management

// Questions
GET /api/modules/:moduleId/questions
Response: Question[]

GET /api/questions/:questionId
Response: {
  question: Question;
  relationships: QuestionRelationship[];
  context: AIContext[];
}

// Left Panel: User Answers
POST /api/user-answers
{
  project_id: string;
  question_id: string;
  content: string;
}
Response: UserAnswer

PUT /api/user-answers/:answerId/approve
Response: { approved: boolean }

// Right Panel: AI Conversations
POST /api/ai/get-help
{
  question_id: string;
  project_id: string;
}
Response: {
  suggestions: AISuggestion[];
  conversation_id: string;
}

POST /api/ai/chat
{
  conversation_id: string;
  message: string;
}
Response: {
  response: string;
  tokens_used: number;
}

// OpenRouter Integration
POST /api/ai/openrouter
{
  messages: ChatMessage[];
  model?: string;
  project_id: string;
  question_id?: string;
}
Response: {
  content: string;
  usage: TokenUsage;
  model: string;
}
Brand Portal and Deliverables

// Brand Portal
GET /api/projects/:projectId/brand-portal
Response: BrandPortal

POST /api/projects/:projectId/generate-portal
Response: { status: 'generating' | 'ready'; url?: string }

// Exports
POST /api/projects/:projectId/export
{
  format: 'pdf' | 'markdown';
  sections: string[];
}
Response: { job_id: string; estimated_completion: string }

GET /api/export-jobs/:jobId
Response: {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  error?: string;
}
Real-time Collaboration

// WebSocket Events
interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'answer_updated' | 'ai_suggestion' | 'answer_approved';
  project_id: string;
  question_id?: string;
  user_id: string;
  data: any;
  timestamp: string;
}

// Subscription channels
`projects:${projectId}:user_answers`
`projects:${projectId}:ai_conversations`
`businesses:${businessId}:activity`
Authentication and Rate Limiting

Authentication: - JWT tokens via Supabase Auth - Tokens expire after 24 hours with automatic refresh - Row Level Security enforced at database level - Role-based access control for all endpoints

Rate Limiting: - General API: 1000 requests/hour per user - AI suggestions: 100 requests/hour per user - Export generation: 10 requests/hour per user - File uploads: 50MB total per user per day - OpenRouter calls: Cost-based limiting per business

Error Handling: ```typescript interface APIError { code: string; message: string; details?: any; correlation_id: string; }

// Standard error codes 'AUTHREQUIRED' | 'INSUFFICIENTPERMISSIONS' | 'RATELIMITED' | 'VALIDATIONERROR' | 'RESOURCENOTFOUND' | 'AISERVICEUNAVAILABLE' | 'OPENROUTERQUOTAEXCEEDED' | 'PREREQUISITENOTCOMPLETED' ```

8. Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- User roles for admin functionality
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'super_admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core business entities with proper multi-tenancy
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'in_house', -- 'agency' or 'in_house'
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL DEFAULT auth.uid(),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membership table for multi-user access
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'project_manager', 'contributor', 'client', 'viewer'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(business_id, user_id)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- Inherited from business
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, slug)
);

-- Module system
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  prerequisites UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  module_type TEXT DEFAULT 'standard', -- 'standard', 'specialized'
  category TEXT NOT NULL, -- 'foundation', 'brand', 'customer', 'messaging', 'website', 'execution'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions with 6-part framework
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  
  -- Core question data
  title TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'text', 'dropdown', 'multiselect', 'slider', 'card_sorting', 'moodboard', 'scenario_branching'
  sort_order INTEGER DEFAULT 0,
  prerequisites UUID[] DEFAULT '{}',
  
  -- 6-Part Framework Fields
  definition TEXT NOT NULL,           -- "What this means, in plain terms"
  examples TEXT[] DEFAULT '{}',       -- Array of real-world examples
  demonstrations JSONB DEFAULT '{}',  -- Visual/interactive demonstrations
  why_it_matters TEXT NOT NULL,       -- Downstream impact explanation
  simple_terms TEXT NOT NULL,         -- Kid-friendly restatement
  confidence_calibration_enabled BOOLEAN DEFAULT true,
  
  -- Technical config
  ai_assistance_enabled BOOLEAN DEFAULT true,
  validation_rules JSONB DEFAULT '{}',
  ui_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question relationships and dependencies (manually created mapping graph)
CREATE TABLE question_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  target_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'prerequisite', 'feeds_forward', 'validates', 'blocks'
  weight DECIMAL DEFAULT 1.0, -- Importance weight for AI context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_question_id, target_question_id, relationship_type)
);

-- LEFT PANEL: User workspace for answers
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- For RLS

  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  version_number INTEGER, -- 1, 2, 3 for multiple attempts

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIGHT PANEL: AI assistant conversation
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL for AI messages
  tenant_id UUID NOT NULL, -- For RLS

  message_type TEXT NOT NULL, -- 'ai_suggestion', 'user_chat', 'ai_chat'
  content TEXT NOT NULL,

  -- AI processing details
  ai_context JSONB, -- Context sent to LLM
  ai_model TEXT,
  ai_tokens_used INTEGER,
  ai_cost DECIMAL(10,4), -- Cost in USD from OpenRouter

  -- Conversation threading
  parent_message_id UUID REFERENCES ai_conversations(id),
  conversation_turn INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main responses table points to approved user answer
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- For RLS

  approved_answer_id UUID REFERENCES user_answers(id), -- Points to left panel
  status TEXT DEFAULT 'unanswered', -- 'unanswered', 'draft', 'ai_suggested', 'in_review', 'approved'
  confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 10),
  needs_review BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, question_id)
);

-- Strategy paths and module groupings
CREATE TABLE strategy_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Startup Path', 'Growth Path', 'Enterprise Path', 'Agency Path'
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  target_audience TEXT, -- 'startups', 'growth_companies', 'enterprises', 'agencies'
  module_sequence UUID[] NOT NULL, -- Ordered array of module IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand portal sections (20 components across 5 sections)
CREATE TABLE brand_portal_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  section_type TEXT NOT NULL, -- 'brand_strategy', 'verbal_identity', 'visual_identity', 'customer_intelligence', 'brand_applications'
  component_type TEXT NOT NULL, -- 'purpose', 'positioning', 'tagline', 'logo', etc.
  content JSONB NOT NULL,
  assets JSONB DEFAULT '{}', -- File URLs, images, documents
  is_completed BOOLEAN DEFAULT false,
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, section_type, component_type)
);

-- Analysis results from n8n workflows (competitor auditor, business analyzer)
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  analysis_type TEXT NOT NULL, -- 'competitor_analysis', 'website_audit', 'seo_analysis'
  target_url TEXT,
  workflow_id TEXT, -- n8n workflow identifier
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  results JSONB, -- Analysis results from n8n
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Activations and post-strategy executions (activation marketplace)
CREATE TABLE activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  activation_type TEXT NOT NULL, -- 'seo_plan', 'content_calendar', 'ad_campaign', 'email_sequence'
  focus_area TEXT NOT NULL, -- 'seo', 'content', 'advertising', 'email', 'social'
  sub_area TEXT, -- 'local_seo', 'on_page', 'hook_writing', etc.
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  brief JSONB, -- Activation brief and requirements
  deliverables JSONB, -- Generated deliverables
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables and exports
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'brand_guide', 'strategy_report', 'activation_brief'
  format TEXT NOT NULL, -- 'markdown', 'pdf', 'html'
  content JSONB NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'generating', 'ready'
  version INTEGER DEFAULT 1,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI context and embeddings for RAG system
CREATE TABLE ai_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'response', 'analysis', 'brand_section'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_portal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access data from businesses they're members of)
CREATE POLICY "Users can access businesses they're members of" 
ON businesses FOR ALL 
USING (
  id IN (
    SELECT business_id FROM memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access projects from their businesses" 
ON projects FOR ALL 
USING (
  business_id IN (
    SELECT business_id FROM memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access user_answers from their projects" 
ON user_answers FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access ai_conversations from their projects" 
ON ai_conversations FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can access responses from their projects" 
ON responses FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN memberships m ON p.business_id = m.business_id
    WHERE m.user_id = auth.uid()
  )
);

-- Additional RLS policies for other tables follow the same pattern...

-- Performance indexes
CREATE INDEX idx_user_answers_project_question ON user_answers(project_id, question_id);
CREATE INDEX idx_ai_conversations_project_question ON ai_conversations(project_id, question_id);
CREATE INDEX idx_responses_project_question ON responses(project_id, question_id);
CREATE INDEX idx_memberships_business_user ON memberships(business_id, user_id);
CREATE INDEX idx_projects_business ON projects(business_id);
CREATE INDEX idx_brand_portal_project_section ON brand_portal_sections(project_id, section_type);
CREATE INDEX idx_analysis_results_project ON analysis_results(project_id);
CREATE INDEX idx_activations_project ON activations(project_id);
CREATE INDEX idx_deliverables_project ON deliverables(project_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_question_relationships_source ON question_relationships(source_question_id);
CREATE INDEX idx_ai_contexts_project ON ai_contexts(project_id);

-- Vector similarity search function for RAG
CREATE OR REPLACE FUNCTION match_contexts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project_id uuid
)
RETURNS TABLE(
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $
BEGIN
  RETURN QUERY
  SELECT
    ai_contexts.id,
    ai_contexts.content,
    1 - (ai_contexts.embedding <=> query_embedding) AS similarity
  FROM ai_contexts
  WHERE ai_contexts.project_id = filter_project_id
    AND 1 - (ai_contexts.embedding <=> query_embedding) > match_threshold
  ORDER BY ai_contexts.embedding <=> query_embedding
  LIMIT match_count;
END;
$;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_user_answers_updated_at BEFORE UPDATE ON user_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_portal_updated_at BEFORE UPDATE ON brand_portal_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activations_updated_at BEFORE UPDATE ON activations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
Environment Variables

# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter Integration (Single LLM Gateway)
OPENROUTER_API_KEY=sk_or_xxxxx
AI_ROUTER=direct  # 'direct' or 'n8n'

# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-run
N8N_API_KEY=your_n8n_api_key

# Email
RESEND_API_KEY=your_resend_api_key

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For production
VERCEL_URL=your_vercel_deployment_url
9. Implementation Plan
Phase 1: Foundation (Months 1-3)

Sprint 1-2: Core Infrastructure (4 weeks) - Next.js 15 project setup with TypeScript (3 days) - Supabase database and authentication integration (5 days) - Complete database schema implementation (7 days) - Row-level security policies and multi-tenancy (3 days) - Basic UI components with shadcn/ui (2 days)

Sprint 3-4: User Management & Authentication (4 weeks) - User registration and email verification (5 days) - Role-based access control implementation (5 days) - Business and project creation workflows (5 days) - Team invitation and membership system (5 days)

Sprint 5-6: Basic Workshop Interface (4 weeks) - Question framework implementation (6-part system) (7 days) - Two-panel UI architecture (left: user workspace, right: AI assistant) (7 days) - M1 foundational questions (57+ questions) (6 days)

Phase 2: AI Integration (Months 4-5)

Sprint 7-8: OpenRouter Integration (4 weeks) - OpenRouter API client implementation (3 days) - AI routing system (direct vs n8n) (4 days) - Question mapping graph processing (5 days) - Context-aware AI prompts and responses (5 days) - Usage tracking and cost management (3 days)

Sprint 9-10: Advanced AI Features (4 weeks) - Question relationship processing for AI context (7 days) - RAG system for large project contexts (5 days) - AI conversation threading and chat interface (5 days) - Response caching and optimization (3 days)

Phase 3: Workshop Experience (Months 6-8)

Sprint 11-12: Interactive Question Types (4 weeks) - Tone sliders and rating components (5 days) - Card sorting functionality (5 days) - Confidence calibration system (3 days) - Auto-save and draft management (3 days) - Progress tracking and visualization (4 days)

Sprint 13-14: Real-time Collaboration (4 weeks) - Supabase Realtime integration (5 days) - Multi-user workspace with live updates (7 days) - Comment and discussion system (5 days) - Activity feeds and notifications (3 days)

Sprint 15-16: Module System (4 weeks) - Complete M2-M10 module implementation (10 days) - Module dependencies and unlocking logic (3 days) - Strategy path configurations (3 days) - Progress calculation algorithms (4 days)

Phase 4: Brand Portal & Deliverables (Months 9-10)

Sprint 17-18: Interactive Brand Portal (4 weeks) - 20-component brand guide system (10 days) - Real-time updates from approved responses (4 days) - Section navigation and organization (3 days) - Asset management and file uploads (3 days)

Sprint 19-20: Export System (4 weeks) - PDF generation with @react-pdf/renderer (7 days) - Markdown export functionality (3 days) - Version control and history tracking (4 days) - Background job processing with Vercel Cron (6 days)

Phase 5: Advanced Features (Months 11-12)

Sprint 21-22: External Integrations (4 weeks) - n8n workflow integration (7 days) - Competitor analysis automation (5 days) - Website audit capabilities (5 days) - Webhook handling and processing (3 days)

Sprint 23-24: Activation Marketplace (4 weeks) - Post-foundation activation system (8 days) - AI-generated marketing briefs (5 days) - Tactical deliverable creation (4 days) - Integration with brand guidelines (3 days)

Development Team Requirements

Core Team (Months 1-6): - 1 Full-Stack Developer (Next.js + Supabase expert) - 1 Frontend Developer (React + TypeScript) - 1 AI/ML Engineer (OpenRouter integration, RAG systems) - 1 Product Manager/Technical Lead - 1 UI/UX Designer

Expanded Team (Months 7-12): - +1 Backend Developer (API optimization, n8n integration) - +1 DevOps Engineer (Deployment, monitoring, scaling) - +1 QA Engineer (Testing automation, quality assurance)

Risk Mitigation

Technical Risks: - AI Cost Overruns: Implement strict rate limiting and usage quotas from day 1 - Database Performance: Proper indexing and query optimization in early phases - Real-time Scaling: Load testing with Supabase Realtime before production

Business Risks: - Feature Creep: Strict adherence to defined MVP scope for first 6 months - User Adoption: Early user testing and feedback integration in Phase 2 - Competitive Pressure: Rapid MVP delivery within 6 months to establish market position

10. Success Metrics
Product Metrics

Metric	Target	Measurement Method	Review Frequency
User Activation	85% complete M1 within 7 days	Database: responses.status = 'approved' for M1 questions	Weekly
Module Completion	Average 8+ modules per project	Calculate modules completed per project_id	Monthly
Time to Value	< 3 days from signup to first brand portal	Track: registration → first brandportalsections.is_completed = true	Weekly
AI Utilization	70% of questions use AI assistance	Count: ai_conversations per question vs total questions answered	Monthly
Collaboration Rate	60% of projects have multiple users	Count: projects with >1 user in memberships table	Monthly
Question Mapping Effectiveness	80%+ AI suggestion acceptance rate	Track: AI suggestions copied to user_answers and approved	Monthly
Business Metrics

Metric	Target	Measurement Method	Review Frequency
Monthly Recurring Revenue	$10M ARR by month 24	Sum of active subscription values	Monthly
Customer Acquisition	500 agencies by month 18	Count: businesses where type = 'agency'	Monthly
Customer Lifetime Value	$50,000 (agencies), $15,000 (in-house)	Cohort analysis of subscription revenue	Quarterly
Customer Acquisition Cost	<$2,000 (agencies), <$500 (in-house)	Marketing spend / new customers acquired	Monthly
Churn Rate	<5% monthly churn	Track: canceled subscriptions / active subscriptions	Monthly
Net Promoter Score	>50 overall	Quarterly user surveys	Quarterly
Technical Metrics

Metric	Target	Measurement Method	Review Frequency
System Uptime	99.9% availability	Vercel analytics + Supabase monitoring	Daily
Page Load Performance	<2 seconds average	Core Web Vitals tracking	Weekly
AI Response Time	<5 seconds for suggestions	OpenRouter API response time tracking	Daily
Database Performance	<100ms for 95th percentile queries	Supabase performance monitoring	Daily
Real-time Latency	<500ms for live updates	Supabase Realtime metrics	Weekly
Error Rate	<0.1% of requests	Error tracking with Sentry	Daily
User Experience Metrics

Metric	Target	Measurement Method	Review Frequency
Question Completion Rate	90% of started questions completed	Track: questions started vs completed per user	Weekly
Session Duration	45+ minutes average in workshop	User analytics tracking	Weekly
Feature Adoption	80% use interactive question types	Track usage of sliders, card sorting, etc.	Monthly
Brand Portal Engagement	5+ minutes average viewing time	Analytics on brand portal page views	Monthly
Export Usage	70% of completed projects export deliverables	Track: deliverables.status = 'ready'	Monthly
Confidence Score Trends	Average confidence >7/10 by project completion	Track: responses.confidence_score progression	Monthly
Revenue and Growth Metrics

Metric	Target	Measurement Method	Review Frequency
Average Revenue Per User	$2,500/year (agencies), $800/year (in-house)	Annual subscription revenue / active users	Quarterly
Feature Utilization	60% use advanced modules (M11+)	Track: module completion beyond foundation	Monthly
Expansion Revenue	30% of customers upgrade within 6 months	Track: plan changes and module additions	Quarterly
Geographic Expansion	20% revenue from German market by month 18	Revenue tracking by user location	Quarterly
Agency Client Growth	Average 5 client businesses per agency	Count: client businesses per agency account	Monthly
Retention Rate	95% annual retention for agencies, 85% for in-house	Cohort analysis of subscription renewals	Quarterly
Implementation Tracking

Development Velocity: - Sprint velocity tracking (story points completed) - Feature delivery against timeline (monthly milestone reviews) - Technical debt management (code quality metrics) - Bug resolution time (<24 hours for critical, <1 week for non-critical)

User Feedback Integration: - Weekly user interview sessions during beta - Feature request tracking and prioritization - Support ticket resolution time (<2 hours response, <24 hours resolution) - Community engagement metrics (if applicable)

Competitive Analysis: - Monthly competitor feature analysis - Market positioning assessment - Pricing optimization based on market feedback - Partnership opportunity identification

Success Criteria Review Process

Weekly Reviews: - Product metrics dashboard review - Technical performance monitoring - User feedback triage and prioritization

Monthly Reviews: - Business metrics analysis - Feature adoption and usage patterns - Revenue tracking and forecasting - Technical debt assessment

Quarterly Reviews: - Strategic goal assessment - Market position evaluation - Resource allocation optimization - Roadmap adjustment based on metrics

This comprehensive metrics framework ensures the S1BMW platform delivers on its core promise of transforming brand strategy development while maintaining technical excellence and sustainable business growth.

Conclusion
This PRD provides a complete blueprint for building the S1BMW platform - a revolutionary AI-powered brand development system that bridges strategy and implementation. The document combines strategic vision with detailed technical specifications, ensuring development teams can build immediately while stakeholders understand the market opportunity and expected outcomes.

Key Success Factors: 1. Strategy First Knowledge Graph: 1,800+ question relationships ensure AI suggestions maintain strategic consistency 2. OpenRouter Integration: Single gateway for multiple AI models with cost optimization 3. Two-Panel Workshop UI: Clean separation between user workspace and AI assistance 4. Real-time Collaboration: Multi-user workshops with live updates and role-based permissions 5. Implementation Bridge: Actual deliverables that connect strategy to execution 6. Scalable Architecture: Multi-tenant system ready for global agency adoption

The platform transforms the $50B brand consulting market through intelligent automation while maintaining the strategic depth that drives business results. With this PRD, development teams have everything needed to build a production-ready system that can capture significant market share in the emerging AI-powered professional services category.