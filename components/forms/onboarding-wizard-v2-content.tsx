'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PathSelection } from '@/components/forms/path-selection';
import { StrategicResults } from '@/components/forms/strategic-results';
import { SegmentSelection } from '@/components/forms/segment-selection';
import { PersonaSelection } from '@/components/forms/persona-selection';
import { MarketSegment, BuyerPersona } from '@/app/actions/businesses';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Package,
  Target,
  Users,
  User,
  BarChart3,
  Award,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Plus,
  X,
  ChevronDown,
  Sparkles,
  RefreshCw,
  MessageCircle,
  Copy,
} from 'lucide-react';

interface Service {
  name: string;
  description: string;
  url?: string;
}

interface Competitor {
  name: string;
  url: string;
  notes: string;
}

interface FormData {
  selectedPath?: 'strategic-foundation' | 'quick-start' | 'build-from-scratch';
  businessName: string;
  website: string;
  industry: string;
  linkedinUrl: string;
  businessType: string;
  yearsInBusiness: string;
  employeeCount: string;
  annualRevenue: string;
  brandAssets: File[];
  services: Service[];
  serviceDelivery: string;
  uniqueValue: string;
  competitors: Competitor[];
  competitiveAdvantage: string;
  marketPosition: string;
  // Segment and Persona selection
  primarySegment?: MarketSegment;
  secondarySegment?: MarketSegment;
  selectedPersona?: BuyerPersona;
  personaCustomizations?: string;
  // Legacy text fields for backward compatibility
  targetAudience: string;
  customerPersonas: string;
  businessDescription: string;
  targetProblem: string;
  currentCategory: string;
  mainObstacle: string;
  desiredTransformation: string;
  whyNow: string;
  whyYou: string;
  secretSauce: string;
  brandValues: string;
  controversialBelief: string;
  notDoing: string;
  customerAlternatives: string;
  uniqueApproach: string;
  decisionTrigger: string;
  valueProposition: string;
  successMetrics: string;
  confidenceScores: Record<number, number | 'N/A'>;
  // Quick Start specific fields
  quickBusinessDetails?: any;
  quickSegment?: MarketSegment;
  quickPersona?: BuyerPersona;
  expensiveProblem?: string;
  customerGoals?: string;
  currentAlternatives?: string;
  quickCompetitors?: Competitor[];
  uniqueApproachQuick?: string;
  whyChooseYou?: string;
  successMetricQuick?: string;
  coreIdentity?: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  questionCount: number;
  questions: number[];
}

// Path-specific configurations
const pathConfigurations = {
  'strategic-foundation': {
    sections: [
      {
        id: 'business-basics',
        title: 'Business Basics',
        icon: Building2,
        questionCount: 9,
        questions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      },
      {
        id: 'services-products',
        title: 'Services & Products',
        icon: Package,
        questionCount: 3,
        questions: [9, 10, 11],
      },
      {
        id: 'market-competition',
        title: 'Market & Competition',
        icon: Target,
        questionCount: 3,
        questions: [12, 13, 14],
      },
      {
        id: 'target-audience',
        title: 'Target Audience',
        icon: Users,
        questionCount: 1,
        questions: [15],
      },
      {
        id: 'customer-personas',
        title: 'Customer Personas',
        icon: User,
        questionCount: 1,
        questions: [16],
      },
      {
        id: 'strategic-positioning',
        title: 'Strategic Positioning',
        icon: BarChart3,
        questionCount: 16,
        questions: Array.from({ length: 16 }, (_, i) => i + 17),
      },
      {
        id: 'strategic-truth-snapshot',
        title: 'Strategic Truth Snapshot',
        icon: Award,
        questionCount: 1,
        questions: [33],
      },
    ],
    questions: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
    ],
  },
  'quick-start': {
    sections: [
      {
        id: 'business-basics-quick',
        title: 'Business Basics',
        icon: Building2,
        questionCount: 1,
        questions: [34],
      },
      {
        id: 'segment-persona-quick',
        title: 'Segment & Persona',
        icon: Users,
        questionCount: 2,
        questions: [35, 36],
      },
      {
        id: 'essential-questions',
        title: 'Essential Questions',
        icon: Target,
        questionCount: 8,
        questions: [37, 38, 39, 40, 41, 42, 43, 44],
      },
    ],
    questions: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
  },
  'build-from-scratch': {
    sections: [
      {
        id: 'minimal-setup',
        title: 'Minimal Setup',
        icon: Building2,
        questionCount: 2,
        questions: [45, 46],
      },
    ],
    questions: [45, 46],
  },
};

const sections: Section[] = [
  {
    id: 'business-basics',
    title: 'Business Basics',
    icon: Building2,
    questionCount: 9,
    questions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'services-products',
    title: 'Services & Products',
    icon: Package,
    questionCount: 3,
    questions: [9, 10, 11],
  },
  {
    id: 'market-competition',
    title: 'Market & Competition',
    icon: Target,
    questionCount: 3,
    questions: [12, 13, 14],
  },
  {
    id: 'target-audience',
    title: 'Target Audience',
    icon: Users,
    questionCount: 1,
    questions: [15],
  },
  {
    id: 'customer-personas',
    title: 'Customer Personas',
    icon: User,
    questionCount: 1,
    questions: [16],
  },
  {
    id: 'strategic-positioning',
    title: 'Strategic Positioning',
    icon: BarChart3,
    questionCount: 16,
    questions: Array.from({ length: 16 }, (_, i) => i + 17),
  },
  {
    id: 'strategic-truth-snapshot',
    title: 'Strategic Truth Snapshot',
    icon: Award,
    questionCount: 1,
    questions: [33],
  },
];

const questions = [
  // Strategic Foundation Questions (0-33)
  // Business Basics (0-8)
  {
    title: 'What is your business name?',
    field: 'businessName',
    type: 'input',
  },
  { title: 'What is your website?', field: 'website', type: 'input' },
  { title: 'What industry are you in?', field: 'industry', type: 'select' },
  {
    title: "What's your LinkedIn company page?",
    field: 'linkedinUrl',
    type: 'input',
  },
  {
    title: 'What type of business do you run?',
    field: 'businessType',
    type: 'radio',
  },
  {
    title: 'How long have you been in business?',
    field: 'yearsInBusiness',
    type: 'radio',
  },
  {
    title: 'How many employees do you have?',
    field: 'employeeCount',
    type: 'radio',
  },
  {
    title: "What's your annual revenue?",
    field: 'annualRevenue',
    type: 'radio',
  },
  {
    title: 'Upload brand assets (logos, brand deck, style guides)',
    field: 'brandAssets',
    type: 'file-upload',
  },

  // Services & Products (9-11)
  {
    title: 'What are your primary services or products?',
    field: 'services',
    type: 'services',
  },
  {
    title: 'How do you deliver your services?',
    field: 'serviceDelivery',
    type: 'radio',
  },
  {
    title: 'What makes your offering unique?',
    field: 'uniqueValue',
    type: 'textarea',
  },

  // Market & Competition (12-14)
  {
    title: 'Who are your main competitors?',
    field: 'competitors',
    type: 'competitors',
  },
  {
    title: "What's your competitive advantage?",
    field: 'competitiveAdvantage',
    type: 'textarea',
  },
  {
    title: 'How do you position yourself in the market?',
    field: 'marketPosition',
    type: 'radio',
  },

  // Target Audience & Personas (15-16)
  {
    title: 'Who is your target audience?',
    field: 'targetAudience',
    type: 'segments',
  },
  {
    title: 'Define your customer personas',
    field: 'customerPersonas',
    type: 'personas',
  },

  // Strategic Positioning (17-32)
  {
    title: 'Describe your business in 2-3 sentences',
    field: 'businessDescription',
    type: 'textarea',
  },
  {
    title: 'What problem do you solve?',
    field: 'targetProblem',
    type: 'textarea',
  },
  {
    title: 'What category are you in?',
    field: 'currentCategory',
    type: 'input',
  },
  {
    title: "What's the main obstacle customers face?",
    field: 'mainObstacle',
    type: 'textarea',
  },
  {
    title: 'What transformation do you enable?',
    field: 'desiredTransformation',
    type: 'textarea',
  },
  { title: 'Why is this important now?', field: 'whyNow', type: 'textarea' },
  { title: 'Why are you the right choice?', field: 'whyYou', type: 'textarea' },
  {
    title: "What's your secret sauce?",
    field: 'secretSauce',
    type: 'textarea',
  },
  {
    title: 'What are your brand values?',
    field: 'brandValues',
    type: 'textarea',
  },
  {
    title: 'What controversial belief do you hold?',
    field: 'controversialBelief',
    type: 'textarea',
  },
  { title: 'What do you NOT do?', field: 'notDoing', type: 'textarea' },
  {
    title: 'What alternatives do customers have?',
    field: 'customerAlternatives',
    type: 'textarea',
  },
  {
    title: "What's your unique approach?",
    field: 'uniqueApproach',
    type: 'textarea',
  },
  {
    title: 'What triggers the buying decision?',
    field: 'decisionTrigger',
    type: 'textarea',
  },
  {
    title: "What's your core value proposition?",
    field: 'valueProposition',
    type: 'textarea',
  },
  {
    title: 'How do you measure success?',
    field: 'successMetrics',
    type: 'textarea',
  },

  // Strategic Truth Snapshot (33)
  {
    title: 'Review Your Strategic Foundation',
    field: 'finalReview',
    type: 'review',
  },

  // Quick Start Questions (34-44)
  // Business Basics Quick (34)
  {
    title: 'Business Details',
    field: 'quickBusinessDetails',
    type: 'quick-business-basics',
  },

  // Segment & Persona Quick (35-36)
  {
    title: 'Select your target segment',
    field: 'quickSegment',
    type: 'quick-segments',
  },
  {
    title: 'Select your buyer persona',
    field: 'quickPersona',
    type: 'quick-personas',
  },

  // Essential Questions (37-44)
  {
    title:
      'What expensive problem do you solve and what pain points does it create?',
    field: 'expensiveProblem',
    type: 'textarea',
  },
  {
    title: 'What transformation or goals do your customers want to achieve?',
    field: 'customerGoals',
    type: 'textarea',
  },
  {
    title:
      'What alternatives do customers currently use to solve this problem?',
    field: 'currentAlternatives',
    type: 'textarea',
  },
  {
    title: 'Who are your 3 main competitors? (Please provide URLs)',
    field: 'quickCompetitors',
    type: 'quick-competitors',
  },
  {
    title: 'How do you solve this problem differently than others?',
    field: 'uniqueApproachQuick',
    type: 'textarea',
  },
  {
    title: "What's the primary reason customers choose you over alternatives?",
    field: 'whyChooseYou',
    type: 'textarea',
  },
  {
    title: "What's your main success metric or goal?",
    field: 'successMetricQuick',
    type: 'textarea',
  },
  {
    title: "Complete this statement: We're the [X] who [Y]",
    field: 'coreIdentity',
    type: 'input',
  },

  // Build From Scratch Questions (45-46)
  {
    title: 'Basic Business Information',
    field: 'scratchBusinessInfo',
    type: 'scratch-basics',
  },
  {
    title: 'Choose Your Starting Point',
    field: 'startingPoint',
    type: 'starting-point-selection',
  },
];

interface OnboardingWizardV2ContentProps {
  userId?: string;
  businessId?: string;
  existingBusiness?: any;
  selectedPath?: 'strategic-foundation' | 'quick-start' | 'build-from-scratch';
  onComplete?: (result: any) => void;
  onClose?: () => void;
}

export function OnboardingWizardV2Content({
  userId,
  businessId,
  existingBusiness,
  onComplete,
  onClose,
}: OnboardingWizardV2ContentProps) {
  const [showPathSelection, setShowPathSelection] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sectionsExpanded, setSectionsExpanded] = useState<
    Record<string, boolean>
  >({
    'business-basics': true,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeGuidanceTab, setActiveGuidanceTab] = useState<
    'tips' | 'examples' | 'eli5' | 'alternatives' | 'whyMatters' | null
  >(null);
  const [showAISuggestions, setShowAISuggestions] = useState<
    Record<number, boolean>
  >({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<number, string[]>>(
    {}
  );
  const [loadingSuggestions, setLoadingSuggestions] = useState<
    Record<number, boolean>
  >({});
  const [chatMessages, setChatMessages] = useState<
    Record<number, Array<{ role: 'user' | 'assistant'; content: string }>>
  >({});
  const [chatInput, setChatInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    selectedPath: 'strategic-foundation',
    businessName: 'Example Corp',
    website: 'https://example.com',
    industry: 'Technology',
    linkedinUrl: 'linkedin.com/company/example',
    businessType: 'B2B',
    yearsInBusiness: '3-5',
    employeeCount: '11-50',
    annualRevenue: '$1M-$10M',
    brandAssets: [],
    services: [{ name: '', description: '', url: '' }],
    serviceDelivery: '',
    uniqueValue: '',
    competitors: [{ name: '', url: '', notes: '' }],
    competitiveAdvantage: '',
    marketPosition: '',
    targetAudience: '',
    customerPersonas: '',
    businessDescription: '',
    targetProblem: '',
    currentCategory: '',
    mainObstacle: '',
    desiredTransformation: '',
    whyNow: '',
    whyYou: '',
    secretSauce: '',
    brandValues: '',
    controversialBelief: '',
    notDoing: '',
    customerAlternatives: '',
    uniqueApproach: '',
    decisionTrigger: '',
    valueProposition: '',
    successMetrics: '',
    confidenceScores: {},
  });

  // Get path-specific configuration
  const pathConfig =
    pathConfigurations[formData.selectedPath || 'strategic-foundation'];
  const currentSections = pathConfig.sections;
  const pathQuestions = pathConfig.questions;

  const totalQuestions = pathQuestions.length;
  const progressPercentage = Math.round(
    ((pathQuestions.indexOf(currentQuestion) + 1) / totalQuestions) * 100
  );
  const remainingTime = Math.ceil(
    (totalQuestions - pathQuestions.indexOf(currentQuestion) - 1) * 0.5
  );

  const getCurrentSection = () => {
    for (const section of currentSections) {
      if (section.questions.includes(currentQuestion)) {
        return section;
      }
    }
    return currentSections[0];
  };

  const currentSection = getCurrentSection();
  const questionInSection =
    currentSection.questions.indexOf(currentQuestion) + 1;

  const handleNext = useCallback(() => {
    if (isNextDisabled()) return; // Prevent if disabled

    const currentIndex = pathQuestions.indexOf(currentQuestion);
    if (currentIndex < pathQuestions.length - 1) {
      setCurrentQuestion(pathQuestions[currentIndex + 1]);
    } else {
      setShowResults(true);
    }
  }, [currentQuestion, pathQuestions]);

  const handlePrevious = () => {
    const currentIndex = pathQuestions.indexOf(currentQuestion);
    if (currentIndex > 0) {
      setCurrentQuestion(pathQuestions[currentIndex - 1]);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleQuestionClick = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
  };

  const handleConfidenceChange = (value: number | 'N/A') => {
    setFormData(prev => ({
      ...prev,
      confidenceScores: {
        ...prev.confidenceScores,
        [currentQuestion]: value,
      },
    }));
  };

  const isConfidenceApplicable = (questionIndex: number) => {
    // Skip confidence scoring for Quick Start path entirely
    if (formData.selectedPath === 'quick-start') {
      return false;
    }

    const factualQuestions = [0, 1, 2, 3, 14, 15, 32];
    return !factualQuestions.includes(questionIndex);
  };

  const isNextDisabled = () => {
    const question = questions[currentQuestion];

    // Check confidence scores for applicable questions
    if (
      isConfidenceApplicable(currentQuestion) &&
      !formData.confidenceScores[currentQuestion]
    ) {
      return true;
    }

    // Check segment selection
    if (question?.type === 'segments' && !formData.primarySegment) {
      return true;
    }

    // Check persona selection
    if (question?.type === 'personas' && !formData.selectedPersona) {
      return true;
    }

    return false;
  };

  const generateAISuggestions = async (questionIndex: number) => {
    setLoadingSuggestions(prev => ({ ...prev, [questionIndex]: true }));

    const question = questions[questionIndex];
    const mockSuggestions = {
      businessDescription: [
        'your business helps target customers in your industry transform operational challenges into sustainable competitive advantages through proven methodologies and hands-on implementation support.',
        "We're your industry transformation specialists who work exclusively with companies ready to scale, combining strategic expertise with practical execution to deliver measurable results in 90 days or less.",
        'your business bridges the gap between expensive enterprise consulting and generic business advice, providing target customers with partner-level expertise at realistic investment levels.',
      ],
      targetProblem: [
        "Companies struggle with outdated systems and processes that prevent them from scaling efficiently and competing effectively in today's fast-paced market.",
        'Business leaders lack the internal expertise and resources to implement strategic transformations while maintaining day-to-day operations.',
        "Organizations face the challenge of investing significant resources in consultants who don't deliver practical, implementable solutions.",
      ],
      uniqueValue: [
        'Unlike other consultants who provide generic advice, we deliver customized, industry-specific solutions with guaranteed implementation support and measurable outcomes.',
        'We combine deep industry expertise with hands-on execution, ensuring our clients see real results rather than just recommendations.',
        'Our proven methodology transforms complex business challenges into step-by-step implementation plans with built-in accountability and success metrics.',
      ],
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestions = mockSuggestions[
      question.field as keyof typeof mockSuggestions
    ] || [
      'Consider focusing on the specific value you provide to your target customers.',
      'Think about what makes your approach different from competitors in your space.',
      'Describe the transformation or outcome your customers experience after working with you.',
    ];

    setAiSuggestions(prev => ({ ...prev, [questionIndex]: suggestions }));
    setLoadingSuggestions(prev => ({ ...prev, [questionIndex]: false }));
    setShowAISuggestions(prev => ({ ...prev, [questionIndex]: true }));

    if (!chatMessages[questionIndex]) {
      setChatMessages(prev => ({
        ...prev,
        [questionIndex]: [
          {
            role: 'assistant',
            content: `Hi! I'm here to help you with "${questions[questionIndex].title}". What specific aspect would you like assistance with?`,
          },
        ],
      }));
    }
  };

  const handleSuggestionClick = (suggestion: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: suggestion }));
  };

  const injectTextIntoField = (text: string, field: string) => {
    // Update the form data with the suggestion text
    setFormData(prev => ({ ...prev, [field]: text }));
  };

  const sendChatMessage = async (questionIndex: number) => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => ({
      ...prev,
      [questionIndex]: [...(prev[questionIndex] || []), userMessage],
    }));

    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: `That's a great question about "${questions[questionIndex].title}". Here's my suggestion: Consider focusing on the specific outcomes your customers achieve and what makes your approach unique in delivering those results.`,
      };
      setChatMessages(prev => ({
        ...prev,
        [questionIndex]: [...(prev[questionIndex] || []), aiResponse],
      }));
    }, 1000);

    setChatInput('');
  };

  const handlePathSelect = (
    path: 'strategic-foundation' | 'quick-start' | 'build-from-scratch'
  ) => {
    setFormData(prev => ({ ...prev, selectedPath: path }));
    setShowPathSelection(false);

    // Set the first question for the selected path
    const pathConfig = pathConfigurations[path];
    setCurrentQuestion(pathConfig.questions[0]);
  };

  const handleBackToPathSelection = () => {
    setShowPathSelection(true);
  };

  const handleEditResults = () => {
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const handleContinueToPlatform = () => {
    if (onComplete) {
      onComplete(formData);
    }
  };

  const renderGuidanceContent = () => {
    if (!activeGuidanceTab) return null;

    const question = questions[currentQuestion];
    if (!question) return null;

    // Question-specific guidance data
    const getGuidanceForQuestion = (questionField: string) => {
      switch (questionField) {
        case 'businessName':
          return {
            tips: [
              'Use your official business name',
              'Include any DBA (Doing Business As) names if relevant',
              'Make sure it matches your legal documents',
            ],
            examples: [
              'Acme Corp',
              'Smith & Associates LLC',
              'TechFlow Solutions Inc.',
            ],
            eli5: [
              'What name is on your business cards?',
              'What name do customers know you by?',
              "This is how we'll refer to your business",
            ],
            alternatives: [
              'Consider using your trade name if different from legal name',
              "Include your brand name if it's well-known",
              'You can add subsidiaries or divisions separately',
            ],
            whyMatters: [
              'Establishes your brand identity across all materials',
              'Ensures consistency in all communications',
              'Critical for SEO and online discovery',
            ],
          };

        case 'website':
          return {
            tips: [
              'Include the full URL with https://',
              'Use your primary domain',
              'Make sure the website is live and accessible',
            ],
            examples: [
              'https://www.yourcompany.com',
              'https://yourcompany.io',
              'https://www.yourservice.net',
            ],
            eli5: [
              'Where can people find you online?',
              'Your main website address',
              'Include https:// at the beginning',
            ],
          };

        case 'industry':
          return {
            tips: [
              'Be specific rather than generic',
              'Consider your primary industry focus',
              "Think about how you'd describe your industry to investors",
            ],
            examples: [
              'B2B SaaS',
              'Digital Marketing Agency',
              'Management Consulting',
              'E-commerce Technology',
            ],
            eli5: [
              'What business category do you fit into?',
              "How would you complete: 'We're in the ___ industry'",
              'What industry do your competitors operate in?',
            ],
          };

        case 'businessDescription':
          return {
            tips: [
              'Start with what problem you solve',
              'Mention who you serve (target market)',
              'Include your unique approach or differentiator',
            ],
            examples: [
              'We help B2B SaaS companies clarify their positioning and accelerate growth through strategic messaging.',
              'A digital marketing agency specializing in data-driven campaigns for e-commerce brands.',
              'Management consulting firm that transforms traditional businesses through digital innovation.',
            ],
            eli5: [
              'Imagine explaining your business to a friend',
              'What problem do you solve and for whom?',
              'Keep it simple but complete',
            ],
          };

        case 'services':
          return {
            tips: [
              'Be specific about your services and what makes them unique',
              'Think about your ideal customer when describing your offerings',
              'Consider both tangible and intangible value you provide',
            ],
            examples: [
              'Strategic Consulting - We help B2B SaaS companies clarify their positioning',
              'Brand Strategy - We create comprehensive brand guidelines and messaging',
              'Marketing Activation - We implement go-to-market strategies',
            ],
            eli5: [
              'List the main things you do for customers',
              "Describe each service like you're explaining it to a friend",
              'Include a link if you have a page about this service',
            ],
          };

        default:
          return {
            tips: [
              'Be as specific and detailed as possible',
              "Think about your ideal customer's perspective",
              'Use concrete examples when applicable',
            ],
            examples: [
              'Provide specific, real-world examples',
              'Reference actual situations or outcomes',
              'Include relevant details that matter to your business',
            ],
            eli5: [
              'Answer as if explaining to a friend',
              'Use simple, clear language',
              'Focus on the most important aspects',
            ],
            alternatives: [
              'Consider different approaches to this question',
              'Think about various perspectives or angles',
              'Explore alternative ways to frame your response',
            ],
            whyMatters: [
              'This information shapes your strategic positioning',
              'Helps create a comprehensive understanding of your business',
              'Essential for developing targeted messaging and solutions',
            ],
          };
      }
    };

    const guidanceData = getGuidanceForQuestion(question.field);

    return (
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-t-0 rounded-t-none">
        <div className="space-y-2">
          {guidanceData[activeGuidanceTab].map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGuidanceTabs = () => (
    <div className="space-y-0">
      {/* Guidance Tabs */}
      <div className="flex border-b">
        <button
          onClick={() =>
            setActiveGuidanceTab(activeGuidanceTab === 'tips' ? null : 'tips')
          }
          className={cn(
            'flex items-center justify-center gap-1 flex-1 py-2 border-b-2 transition-colors text-sm whitespace-nowrap',
            activeGuidanceTab === 'tips'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          <Lightbulb className="h-3 w-3" />
          Tips
        </button>
        <button
          onClick={() =>
            setActiveGuidanceTab(
              activeGuidanceTab === 'examples' ? null : 'examples'
            )
          }
          className={cn(
            'flex items-center justify-center gap-1 flex-1 py-2 border-b-2 transition-colors text-sm whitespace-nowrap',
            activeGuidanceTab === 'examples'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          <CheckCircle className="h-3 w-3" />
          Examples
        </button>
        <button
          onClick={() =>
            setActiveGuidanceTab(activeGuidanceTab === 'eli5' ? null : 'eli5')
          }
          className={cn(
            'flex items-center justify-center gap-1 flex-1 py-2 border-b-2 transition-colors text-sm whitespace-nowrap',
            activeGuidanceTab === 'eli5'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          <HelpCircle className="h-3 w-3" />
          ELI5
        </button>
        <button
          onClick={() =>
            setActiveGuidanceTab(
              activeGuidanceTab === 'alternatives' ? null : 'alternatives'
            )
          }
          className={cn(
            'flex items-center justify-center gap-1 flex-1 py-2 border-b-2 transition-colors text-sm whitespace-nowrap',
            activeGuidanceTab === 'alternatives'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          <RefreshCw className="h-3 w-3" />
          Alternatives
        </button>
        <button
          onClick={() =>
            setActiveGuidanceTab(
              activeGuidanceTab === 'whyMatters' ? null : 'whyMatters'
            )
          }
          className={cn(
            'flex items-center justify-center gap-1 flex-1 py-2 border-b-2 transition-colors text-sm whitespace-nowrap',
            activeGuidanceTab === 'whyMatters'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          <Target className="h-3 w-3" />
          Why?
        </button>
      </div>
      {renderGuidanceContent()}
    </div>
  );

  const renderQuestion = () => {
    const question = questions[currentQuestion];

    if (!question) {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Question not found</h2>
          <p className="text-muted-foreground">
            This question doesn't exist yet.
          </p>
        </div>
      );
    }

    switch (question.type) {
      case 'input':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                We'll use this to understand your business better
              </p>
            </div>

            {renderGuidanceTabs()}

            <Input
              value={formData[question.field as keyof FormData] as string}
              onChange={e =>
                setFormData({ ...formData, [question.field]: e.target.value })
              }
              placeholder="Enter your answer..."
              className="w-full !bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
            />
          </div>
        );

      case 'file-upload':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                Upload your brand materials to help us understand your visual
                identity
              </p>
            </div>

            {renderGuidanceTabs()}

            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4">
                    <svg
                      className="w-12 h-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Upload Brand Assets
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.svg,.ai,.eps,.zip"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      setFormData({
                        ...formData,
                        brandAssets: [...formData.brandAssets, ...files],
                      });
                    }}
                    className="hidden"
                    id="brand-assets-upload"
                  />
                  <label
                    htmlFor="brand-assets-upload"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
                  >
                    Choose Files
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: PDF, PNG, JPG, SVG, AI, EPS, ZIP (max 10MB each)
                  </p>
                </div>
              </div>

              {formData.brandAssets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">
                    Uploaded Files ({formData.brandAssets.length})
                  </h4>
                  <div className="space-y-2">
                    {formData.brandAssets.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFiles = formData.brandAssets.filter(
                              (_, i) => i !== index
                            );
                            setFormData({ ...formData, brandAssets: newFiles });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                Be as detailed as possible
              </p>
            </div>

            {renderGuidanceTabs()}

            <Textarea
              value={formData[question.field as keyof FormData] as string}
              onChange={e =>
                setFormData({ ...formData, [question.field]: e.target.value })
              }
              placeholder="Enter your answer..."
              className="w-full min-h-[120px] !bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
            />

            {/* AI Suggestions Panel */}
            <div className="w-full">
              {/* Auto-generate suggestions on first load */}
              {(() => {
                if (
                  !aiSuggestions[currentQuestion] &&
                  !loadingSuggestions[currentQuestion]
                ) {
                  setTimeout(() => generateAISuggestions(currentQuestion), 100);
                }
                return null;
              })()}

              {(aiSuggestions[currentQuestion] ||
                loadingSuggestions[currentQuestion]) && (
                <div className="w-full bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-600">
                        AI Suggestions
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => generateAISuggestions(currentQuestion)}
                      disabled={loadingSuggestions[currentQuestion]}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    >
                      <RefreshCw
                        className={cn(
                          'h-4 w-4',
                          loadingSuggestions[currentQuestion] && 'animate-spin'
                        )}
                      />
                      Refresh
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                      Personalized for your business in this context
                    </p>
                    <div className="space-y-3">
                      {aiSuggestions[currentQuestion]?.map(
                        (suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-colors text-sm group"
                          >
                            <button
                              onClick={() =>
                                handleSuggestionClick(
                                  suggestion,
                                  question.field
                                )
                              }
                              className="flex-1 text-left hover:bg-purple-25 dark:hover:bg-purple-950/10 rounded-lg p-2 -m-2 transition-colors"
                            >
                              {suggestion}
                            </button>
                            <button
                              onClick={() =>
                                injectTextIntoField(suggestion, question.field)
                              }
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-all"
                              title="Use this suggestion"
                            >
                              <Copy className="h-4 w-4 text-yellow-600" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-3">
                      💡 Tip: Click any suggestion to use it as-is, or use it as
                      inspiration for your own answer
                    </p>
                  </div>

                  {/* AI Chat Interface */}
                  <div className="border-t border-purple-200 dark:border-purple-800">
                    <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar space-y-3">
                      {chatMessages[currentQuestion]?.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            'p-3 rounded-lg text-sm',
                            message.role === 'user'
                              ? 'bg-purple-100 dark:bg-purple-900/50 ml-8'
                              : 'bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-800 mr-8'
                          )}
                        >
                          <div className="font-medium text-xs mb-1 text-purple-600">
                            {message.role === 'user' ? 'You' : 'Brand Bot'}
                          </div>
                          {message.content}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-purple-200 dark:border-purple-800">
                      <div className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          placeholder="Ask about this question..."
                          onKeyPress={e =>
                            e.key === 'Enter' &&
                            sendChatMessage(currentQuestion)
                          }
                          className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                        />
                        <Button
                          type="button"
                          onClick={() => sendChatMessage(currentQuestion)}
                          className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                Choose the option that best fits
              </p>
            </div>

            {renderGuidanceTabs()}

            <Select
              value={formData[question.field as keyof FormData] as string}
              onValueChange={value =>
                setFormData({ ...formData, [question.field]: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'radio':
        const radioOptions = {
          businessType: [
            { value: 'B2B', label: 'B2B', description: 'Business to Business' },
            { value: 'B2C', label: 'B2C', description: 'Business to Consumer' },
            {
              value: 'B2B2C',
              label: 'B2B2C',
              description: 'Business to Business to Consumer',
            },
            {
              value: 'Marketplace',
              label: 'Marketplace',
              description: 'Platform connecting buyers & sellers',
            },
          ],
          yearsInBusiness: [
            { value: '<1', label: 'Less than 1 year' },
            { value: '1-3', label: '1-3 years' },
            { value: '3-5', label: '3-5 years' },
            { value: '5-10', label: '5-10 years' },
            { value: '10+', label: 'More than 10 years' },
          ],
          employeeCount: [
            { value: '1-10', label: '1-10 employees' },
            { value: '11-50', label: '11-50 employees' },
            { value: '51-200', label: '51-200 employees' },
            { value: '200+', label: 'More than 200 employees' },
          ],
          annualRevenue: [
            { value: '<$100K', label: 'Less than $100K' },
            { value: '$100K-$1M', label: '$100K - $1M' },
            { value: '$1M-$10M', label: '$1M - $10M' },
            { value: '$10M+', label: 'More than $10M' },
          ],
          serviceDelivery: [
            {
              value: 'done-for-you',
              label: 'Done For You',
              description: 'We handle everything',
            },
            {
              value: 'done-with-you',
              label: 'Done With You',
              description: 'Collaborative approach',
            },
            {
              value: 'diy',
              label: 'Do It Yourself',
              description: 'Tools and templates',
            },
          ],
          marketPosition: [
            { value: 'leader', label: 'Market Leader' },
            { value: 'challenger', label: 'Market Challenger' },
            { value: 'niche', label: 'Niche Player' },
            { value: 'new-entrant', label: 'New Entrant' },
          ],
        };

        const options =
          radioOptions[question.field as keyof typeof radioOptions] || [];

        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                Select the option that best describes your business
              </p>
            </div>

            {renderGuidanceTabs()}

            <RadioGroup
              value={formData[question.field as keyof FormData] as string}
              onValueChange={value =>
                setFormData({ ...formData, [question.field]: value })
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {options.map(option => (
                  <label
                    key={option.value}
                    htmlFor={option.value}
                    className={cn(
                      'flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent',
                      formData[question.field as keyof FormData] ===
                        option.value && 'border-yellow-500 bg-yellow-500/10'
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                We'll use this to analyze your service positioning
              </p>
            </div>

            {/* Guidance Tabs */}
            <div className="flex gap-4 border-b">
              <button
                onClick={() =>
                  setActiveGuidanceTab(
                    activeGuidanceTab === 'tips' ? null : 'tips'
                  )
                }
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
                  activeGuidanceTab === 'tips'
                    ? 'border-primary text-primary'
                    : 'border-transparent hover:text-primary'
                )}
              >
                <Lightbulb className="h-4 w-4" />
                Tips
              </button>
              <button
                onClick={() =>
                  setActiveGuidanceTab(
                    activeGuidanceTab === 'examples' ? null : 'examples'
                  )
                }
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
                  activeGuidanceTab === 'examples'
                    ? 'border-primary text-primary'
                    : 'border-transparent hover:text-primary'
                )}
              >
                <CheckCircle className="h-4 w-4" />
                Examples
              </button>
              <button
                onClick={() =>
                  setActiveGuidanceTab(
                    activeGuidanceTab === 'eli5' ? null : 'eli5'
                  )
                }
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
                  activeGuidanceTab === 'eli5'
                    ? 'border-primary text-primary'
                    : 'border-transparent hover:text-primary'
                )}
              >
                <HelpCircle className="h-4 w-4" />
                ELI5
              </button>
            </div>

            {renderGuidanceContent()}

            {/* Services Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Services & Products</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      services: [
                        ...formData.services,
                        { name: '', description: '', url: '' },
                      ],
                    })
                  }
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </div>

              {formData.services.map((service, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Service {index + 1}</h4>
                    {formData.services.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newServices = formData.services.filter(
                            (_, i) => i !== index
                          );
                          setFormData({ ...formData, services: newServices });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`service-name-${index}`}>
                        Service Name
                      </Label>
                      <Input
                        id={`service-name-${index}`}
                        value={service.name}
                        onChange={e => {
                          const newServices = [...formData.services];
                          newServices[index] = {
                            ...service,
                            name: e.target.value,
                          };
                          setFormData({ ...formData, services: newServices });
                        }}
                        placeholder="e.g., Strategic Consulting"
                        className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`service-desc-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`service-desc-${index}`}
                        value={service.description}
                        onChange={e => {
                          const newServices = [...formData.services];
                          newServices[index] = {
                            ...service,
                            description: e.target.value,
                          };
                          setFormData({ ...formData, services: newServices });
                        }}
                        placeholder="Describe what this service includes and the value it provides"
                        rows={3}
                        className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`service-url-${index}`}>
                        URL (optional)
                      </Label>
                      <Input
                        id={`service-url-${index}`}
                        type="url"
                        value={service.url || ''}
                        onChange={e => {
                          const newServices = [...formData.services];
                          newServices[index] = {
                            ...service,
                            url: e.target.value,
                          };
                          setFormData({ ...formData, services: newServices });
                        }}
                        placeholder="https://yoursite.com/services/consulting"
                        className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'competitors':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                Help us understand your competitive landscape
              </p>
            </div>

            {renderGuidanceTabs()}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Competitors</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      competitors: [
                        ...formData.competitors,
                        { name: '', url: '', notes: '' },
                      ],
                    })
                  }
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Competitor
                </Button>
              </div>

              {formData.competitors.map((competitor, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Competitor {index + 1}</h4>
                    {formData.competitors.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCompetitors = formData.competitors.filter(
                            (_, i) => i !== index
                          );
                          setFormData({
                            ...formData,
                            competitors: newCompetitors,
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`competitor-name-${index}`}>
                        Competitor Name
                      </Label>
                      <Input
                        id={`competitor-name-${index}`}
                        value={competitor.name}
                        onChange={e => {
                          const newCompetitors = [...formData.competitors];
                          newCompetitors[index] = {
                            ...competitor,
                            name: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            competitors: newCompetitors,
                          });
                        }}
                        placeholder="Competitor name"
                        className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`competitor-url-${index}`}>
                        Website URL
                      </Label>
                      <Input
                        id={`competitor-url-${index}`}
                        type="url"
                        value={competitor.url}
                        onChange={e => {
                          const newCompetitors = [...formData.competitors];
                          newCompetitors[index] = {
                            ...competitor,
                            url: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            competitors: newCompetitors,
                          });
                        }}
                        placeholder="https://competitor.com"
                        className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`competitor-notes-${index}`}>Notes</Label>
                      <Textarea
                        id={`competitor-notes-${index}`}
                        value={competitor.notes}
                        onChange={e => {
                          const newCompetitors = [...formData.competitors];
                          newCompetitors[index] = {
                            ...competitor,
                            notes: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            competitors: newCompetitors,
                          });
                        }}
                        placeholder="What makes them different? How do they position themselves?"
                        rows={3}
                        className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'segments':
        return (
          <SegmentSelection
            businessData={formData}
            onSegmentSelected={(
              primary: MarketSegment,
              secondary?: MarketSegment
            ) => {
              setFormData({
                ...formData,
                primarySegment: primary,
                secondarySegment: secondary,
                targetAudience: `Primary: ${primary.name}${secondary ? `, Secondary: ${secondary.name}` : ''}`,
              });
            }}
          />
        );

      case 'personas':
        if (!formData.primarySegment) {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{question.title}</h2>
                <p className="text-muted-foreground text-orange-600">
                  Please select your market segment first to generate AI
                  personas.
                </p>
              </div>
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <p className="text-sm">
                  Go back to the previous question to select your target market
                  segment.
                </p>
              </div>
            </div>
          );
        }

        return (
          <PersonaSelection
            primarySegment={formData.primarySegment}
            secondarySegment={formData.secondarySegment}
            onPersonaSelected={(
              primary: BuyerPersona,
              secondary?: BuyerPersona
            ) => {
              setFormData({
                ...formData,
                selectedPersona: primary,
                customerPersonas: `Primary: ${primary.name} - ${primary.description}${secondary ? `, Secondary: ${secondary.name} - ${secondary.description}` : ''}`,
              });
            }}
          />
        );

      case 'quick-business-basics':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Quick Business Setup</h2>
              <p className="text-muted-foreground">
                Just the essentials to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={formData.businessName}
                  onChange={e =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="Your business name"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={e =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://yoursite.com"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={value =>
                    setFormData({ ...formData, industry: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn Company Page</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinUrl}
                  onChange={e =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  placeholder="linkedin.com/company/yourcompany"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
            </div>
          </div>
        );

      case 'quick-segments':
        return (
          <SegmentSelection
            businessData={formData}
            quickStart={true}
            onSegmentSelected={(
              primary: MarketSegment,
              secondary?: MarketSegment
            ) => {
              setFormData({
                ...formData,
                primarySegment: primary,
                secondarySegment: secondary,
                targetAudience: `Primary: ${primary.name}${secondary ? `, Secondary: ${secondary.name}` : ''}`,
              });
            }}
          />
        );

      case 'quick-personas':
        if (!formData.primarySegment) {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{question.title}</h2>
                <p className="text-muted-foreground text-orange-600">
                  Please select your market segment first to generate AI
                  personas.
                </p>
              </div>
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <p className="text-sm">
                  Go back to the previous question to select your target market
                  segment.
                </p>
              </div>
            </div>
          );
        }

        return (
          <PersonaSelection
            primarySegment={formData.primarySegment}
            secondarySegment={formData.secondarySegment}
            quickStart={true}
            onPersonaSelected={(
              primary: BuyerPersona,
              secondary?: BuyerPersona
            ) => {
              setFormData({
                ...formData,
                selectedPersona: primary,
                customerPersonas: `Primary: ${primary.name} - ${primary.description}${secondary ? `, Secondary: ${secondary.name} - ${secondary.description}` : ''}`,
              });
            }}
          />
        );

      case 'quick-competitors':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                List your 3 main competitors with their website URLs
              </p>
            </div>

            <div className="space-y-4">
              {[0, 1, 2].map(index => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label htmlFor={`competitor-name-${index}`}>
                      Competitor {index + 1} Name
                    </Label>
                    <Input
                      id={`competitor-name-${index}`}
                      value={formData.competitors[index]?.name || ''}
                      onChange={e => {
                        const newCompetitors = [...formData.competitors];
                        newCompetitors[index] = {
                          ...newCompetitors[index],
                          name: e.target.value,
                          url: newCompetitors[index]?.url || '',
                          notes: newCompetitors[index]?.notes || '',
                        };
                        setFormData({
                          ...formData,
                          competitors: newCompetitors,
                        });
                      }}
                      placeholder="Competitor name"
                      className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`competitor-url-${index}`}>
                      Website URL
                    </Label>
                    <Input
                      id={`competitor-url-${index}`}
                      type="url"
                      value={formData.competitors[index]?.url || ''}
                      onChange={e => {
                        const newCompetitors = [...formData.competitors];
                        newCompetitors[index] = {
                          ...newCompetitors[index],
                          name: newCompetitors[index]?.name || '',
                          url: e.target.value,
                          notes: newCompetitors[index]?.notes || '',
                        };
                        setFormData({
                          ...formData,
                          competitors: newCompetitors,
                        });
                      }}
                      placeholder="https://competitor.com"
                      className="!bg-yellow-500/10 border-yellow-500/20 focus-visible:!bg-yellow-500/20 focus-visible:ring-yellow-500 focus-visible:border-yellow-500/30"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{question.title}</h2>
              <p className="text-muted-foreground">
                Take a moment to review all your responses. Your strategic
                foundation is complete and ready to be transformed into your
                comprehensive positioning document.
              </p>
            </div>

            {/* Summary Preview */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                Your Strategic Foundation Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Business:</span>{' '}
                  {formData.businessName}
                </div>
                <div>
                  <span className="font-medium">Industry:</span>{' '}
                  {formData.industry}
                </div>
                <div>
                  <span className="font-medium">Business Type:</span>{' '}
                  {formData.businessType}
                </div>
                <div>
                  <span className="font-medium">Years in Business:</span>{' '}
                  {formData.yearsInBusiness}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Target Audience:</span>{' '}
                  {formData.targetAudience || 'Strategic business leaders'}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Core Problem:</span>{' '}
                  {formData.targetProblem ||
                    'Strategic clarity and execution challenges'}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Value Proposition:</span>{' '}
                  {formData.valueProposition ||
                    'Strategic clarity that drives measurable growth'}
                </div>
              </div>
            </div>

            {/* Ready for Results */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Ready to Generate Your Strategic Positioning Document
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your responses will be transformed into a comprehensive
                strategic positioning document with personalized insights,
                competitive analysis, and actionable recommendations.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Next:</strong> Click "Generate Strategic Document" below
                to create your comprehensive positioning document. You'll be
                able to review, edit, and refine everything before finalizing.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{question.title}</h2>
            <p className="text-muted-foreground">
              Question content coming soon...
            </p>
          </div>
        );
    }
  };

  // Show path selection screen first
  if (showPathSelection) {
    return <PathSelection onPathSelect={handlePathSelect} onClose={onClose} />;
  }

  // Show results screen when complete
  if (showResults) {
    return (
      <StrategicResults
        formData={formData}
        onEdit={handleEditResults}
        onContinue={handleContinueToPlatform}
      />
    );
  }

  // Main questionnaire content
  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header - Above everything */}
      <div className="flex justify-center px-4 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-[960px] space-y-2 sm:space-y-4">
          <div className="space-y-3">
            {/* Strategic Foundation and Close Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg sm:text-xl">
                    {formData.selectedPath === 'strategic-foundation'
                      ? '🏆 Strategic Foundation'
                      : formData.selectedPath === 'quick-start'
                        ? '⚡ Quick Start'
                        : '🏗️ Build From Scratch'}
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <button
                  onClick={handleBackToPathSelection}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Choose Different Path
                </button>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Close onboarding"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thin separator line */}
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Business Title and Question Counter */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-semibold">
                Business Onboarding for {formData.businessName}
              </h1>
              <div className="bg-muted px-3 py-1 rounded-md text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {totalQuestions}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
              <span className="font-medium">
                {progressPercentage}% Complete
              </span>
              <span className="text-muted-foreground">
                ~{remainingTime} min remaining
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-foreground h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center px-4 sm:px-6 pb-8">
        <div className="w-full max-w-[960px]">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Left Sidebar - Sections */}
            <div
              className={cn(
                'lg:flex-shrink-0 transition-all duration-300',
                sidebarCollapsed ? 'lg:w-12' : 'lg:w-72'
              )}
            >
              <div className="lg:sticky lg:top-8 space-y-6">
                {/* Collapse Button */}
                {sidebarCollapsed ? (
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      aria-label="Expand sidebar"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Sections</h3>
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      aria-label="Collapse sidebar"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Section Navigation */}
                <div className="space-y-2">
                  {currentSections.map(section => {
                    const Icon = section.icon;
                    const isActive =
                      section.questions.includes(currentQuestion);
                    const isCompleted = section.questions.every(
                      q => q < currentQuestion
                    );
                    const isExpanded = sectionsExpanded[section.id];

                    return (
                      <div key={section.id} className="space-y-1">
                        <button
                          onClick={() => handleSectionClick(section.id)}
                          className={cn(
                            'w-full flex items-center rounded-lg transition-colors text-left text-sm border-2',
                            sidebarCollapsed
                              ? 'justify-center p-2'
                              : 'gap-2 sm:gap-3 px-2 sm:px-3 py-2',
                            isActive
                              ? 'bg-black text-white border-black'
                              : 'hover:bg-accent hover:text-accent-foreground !border-gray-500'
                          )}
                          title={
                            sidebarCollapsed
                              ? `${section.title} (${section.questionCount} questions)`
                              : undefined
                          }
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          {!sidebarCollapsed && (
                            <>
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {section.title}
                                </div>
                                <div className="text-xs opacity-70">
                                  {section.questionCount} questions
                                </div>
                              </div>
                              {isCompleted && (
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </>
                          )}
                        </button>

                        {isExpanded && !sidebarCollapsed && (
                          <div className="space-y-1">
                            {section.questions.map(qIndex => (
                              <button
                                key={qIndex}
                                onClick={() => handleQuestionClick(qIndex)}
                                className={cn(
                                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                                  qIndex === currentQuestion
                                    ? 'bg-yellow-500/10 text-yellow-500 font-medium border-2 border-yellow-500/20'
                                    : 'hover:bg-accent/50 text-muted-foreground border-2 border-gray-200'
                                )}
                              >
                                {qIndex + 1}.{' '}
                                {questions[qIndex]?.title.substring(0, 30)}...
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Question Area */}
            <div className="flex-1 min-w-0">
              <div className={cn('transition-all duration-300', 'w-full')}>
                {/* Question Card with Border/Background */}
                <div className="bg-card border rounded-lg p-4 sm:p-6">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Package className="h-4 w-4" />
                    <span>{currentSection.title}</span>
                    <span>•</span>
                    <span>
                      Question {questionInSection}/
                      {currentSection.questionCount}
                    </span>
                  </div>

                  {/* Question Content */}
                  {renderQuestion()}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-12">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Confidence Scoring */}
                  {isConfidenceApplicable(currentQuestion) && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Confidence:
                      </span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(value => (
                          <button
                            key={value}
                            onClick={() => handleConfidenceChange(value)}
                            className={cn(
                              'w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all',
                              formData.confidenceScores[currentQuestion] ===
                                value
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border hover:border-foreground/50'
                            )}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          onClick={() => handleConfidenceChange('N/A')}
                          className={cn(
                            'px-4 h-10 rounded-lg border-2 text-sm font-medium transition-all',
                            formData.confidenceScores[currentQuestion] === 'N/A'
                              ? 'bg-muted text-muted-foreground border-muted-foreground'
                              : 'border-border hover:border-muted-foreground'
                          )}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleNext}
                    disabled={isNextDisabled()}
                    className="flex items-center gap-2"
                  >
                    {currentQuestion === totalQuestions - 1
                      ? 'Generate Strategic Document'
                      : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
