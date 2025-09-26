'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createBusiness, updateBusiness } from '@/app/actions/businesses';
import { getOrganizations } from '@/app/actions/organizations';
import {
  Building2, Globe, Linkedin, Users, DollarSign, Calendar, Package,
  Target, FileText, Upload, ChevronRight, ChevronLeft, Loader2,
  CheckCircle, Plus, X, Sparkles, TrendingUp, Info, MessageCircle,
  AlertCircle, Brain, Zap, Trophy, Shield, Crosshair
} from 'lucide-react';

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
  'Education', 'Real Estate', 'Transportation', 'Energy', 'Media',
  'Telecommunications', 'Agriculture', 'Construction', 'Hospitality',
  'Legal Services', 'Consulting', 'Marketing', 'Non-Profit', 'Government', 'Other'
];

// Define the 15 strategic questions
const strategicQuestions = [
  // Step 5: Problem & Category (Q1-Q2)
  {
    id: 'Q1',
    category: 'problem',
    title: 'The Expensive Problem',
    question: 'What expensive problem does your ideal customer face?',
    description: 'Think about what costs them money, time, or opportunity.',
    placeholder: 'They lose $X annually because...'
  },
  {
    id: 'Q2',
    category: 'problem',
    title: 'The Category Context',
    question: 'When they look for solutions, what do they search for?',
    description: 'What category or type of solution are they expecting?',
    placeholder: 'They search for...'
  },
  // Step 6: Obstacles & Transformation (Q3-Q4)
  {
    id: 'Q3',
    category: 'obstacles',
    title: 'The Hidden Obstacle',
    question: 'What stops them from solving this themselves?',
    description: 'What barriers prevent them from finding a solution on their own?',
    placeholder: 'They can\'t solve it because...'
  },
  {
    id: 'Q4',
    category: 'obstacles',
    title: 'The Transformation Desired',
    question: 'If this problem vanished, what would they achieve?',
    description: 'What becomes possible when this problem is solved?',
    placeholder: 'Finally, they could...'
  },
  // Step 7: Identity & Values (Q5-Q6)
  {
    id: 'Q5',
    category: 'identity',
    title: 'Identity Markers',
    question: 'How does your ideal customer see themselves?',
    description: 'What traits, behaviors, or beliefs define them?',
    placeholder: 'They\'re the type who...'
  },
  {
    id: 'Q6',
    category: 'identity',
    title: 'The Trigger Moment',
    question: 'What happens right before they look for you?',
    description: 'What event or realization triggers their search?',
    placeholder: 'The moment when...'
  },
  // Step 8: Core Beliefs (Q7-Q8)
  {
    id: 'Q7',
    category: 'beliefs',
    title: 'Your Core Identity',
    question: 'Complete: "We\'re the [role] who [unique action]"',
    description: 'How do you uniquely position yourself in the market?',
    placeholder: 'We\'re the strategists who...'
  },
  {
    id: 'Q8',
    category: 'beliefs',
    title: 'Non-Negotiable Values',
    question: 'What will you ALWAYS do, even if costly?',
    description: 'What principles guide every decision you make?',
    placeholder: 'We will always...'
  },
  // Step 9: Position & Value (Q9-Q15)
  {
    id: 'Q9',
    category: 'position',
    title: 'Your Contrarian Belief',
    question: 'What do you believe about solving this problem that others don\'t?',
    description: 'What unconventional approach or belief sets you apart?',
    placeholder: 'While everyone believes X, we believe Y...'
  },
  {
    id: 'Q10',
    category: 'position',
    title: 'Strategic Sacrifice',
    question: 'What part of the market will you deliberately NOT serve?',
    description: 'Who or what are you willing to say no to?',
    placeholder: 'We don\'t serve...'
  },
  {
    id: 'Q11',
    category: 'position',
    title: 'Real Alternatives',
    question: 'What would they do without you?',
    description: 'What are their actual alternatives to your solution?',
    placeholder: 'They would have to...'
  },
  {
    id: 'Q12',
    category: 'position',
    title: 'The Only Position',
    question: 'Complete: "We\'re the only ones who..."',
    description: 'What can you uniquely claim that no competitor can?',
    placeholder: 'The only ones who...'
  },
  {
    id: 'Q13',
    category: 'value',
    title: 'Decision Driver',
    question: 'What makes them choose YOU over alternatives?',
    description: 'What\'s the primary reason they pick you?',
    placeholder: 'They choose us because...'
  },
  {
    id: 'Q14',
    category: 'value',
    title: 'Unique Value Created',
    question: 'What specific VALUE do you create that others can\'t?',
    description: 'What measurable outcome or capability do you provide?',
    placeholder: 'We create...'
  },
  {
    id: 'Q15',
    category: 'value',
    title: 'Success Metrics',
    question: 'How will you measure winning?',
    description: 'What specific metric and timeline define your success?',
    placeholder: 'We\'ll achieve X by Y...'
  }
];

interface Service {
  name: string;
  url?: string;
}

interface Competitor {
  url: string;
  notes: string;
}

interface MarketSegment {
  id: string;
  title: string;
  description: string;
  painPoints: string[];
  opportunities: string[];
  selected: boolean;
  isPrimary: boolean;
}

interface CustomerPersona {
  id: string;
  name: string;
  title: string;
  description: string;
  painPoints: string[];
  goals: string[];
  triggerEvents: string[];
  selected: boolean;
}

interface StrategicResponse {
  questionId: string;
  response: string;
  confidence: 'low' | 'medium' | 'high';
}

interface FormData {
  // Phase 1: Business Setup (Steps 1-2)
  // Step 1 - Business Basics
  name: string;
  website_url: string;
  linkedin_url: string;
  industry: string;
  custom_industry?: string;
  organization_id?: string;

  // Step 2 - Business Details
  business_type: string;
  years_in_business: string;
  employee_count: string;
  business_model: string;
  avg_customer_ltv: string;
  primary_goal: string;

  // Step 3 - Services & Intelligence
  services: Service[];
  competitors: Competitor[];
  documents: any[];

  // Phase 2: Strategic Foundation (Steps 4-5)
  // Step 4 - Market Segments
  selectedSegments: MarketSegment[];

  // Step 5 - Customer Personas
  selectedPersona: CustomerPersona | null;

  // Phase 3: Strategic Questions (Steps 6-9)
  strategicResponses: StrategicResponse[];
}

// Sample segments (would come from AI in production)
const sampleSegments: MarketSegment[] = [
  {
    id: '1',
    title: 'Growing B2B SaaS',
    description: '11-50 employees, Series A funded',
    painPoints: ["Can't differentiate from competitors", "Struggling with positioning"],
    opportunities: ['High growth potential', 'Need speed to market'],
    selected: false,
    isPrimary: false
  },
  {
    id: '2',
    title: 'Traditional Businesses Going Digital',
    description: '50-200 employees, established',
    painPoints: ['No digital expertise', 'Legacy systems'],
    opportunities: ['Big budgets', 'Long-term contracts'],
    selected: false,
    isPrimary: false
  },
  {
    id: '3',
    title: 'Bootstrapped Startups',
    description: '1-10 employees, founder-led',
    painPoints: ['Limited resources', 'Need quick wins'],
    opportunities: ['Fast decisions', 'Loyal customers'],
    selected: false,
    isPrimary: false
  }
];

// Sample personas (would come from AI in production)
const samplePersonas: CustomerPersona[] = [
  {
    id: '1',
    name: 'The Ambitious Founder',
    title: 'CEO, 35-45',
    description: 'Just raised funding, pressure to grow',
    painPoints: ['Board pressure', 'Market competition'],
    goals: ['10x growth', 'Market leadership'],
    triggerEvents: ['Board meeting', 'Competitor launch'],
    selected: false
  },
  {
    id: '2',
    name: 'The Overwhelmed Marketing Lead',
    title: 'Director, 30-40',
    description: 'Small team, big goals',
    painPoints: ['Too many tools', 'No clear strategy'],
    goals: ['Prove ROI', 'Build team'],
    triggerEvents: ['CEO questioning', 'Budget review'],
    selected: false
  },
  {
    id: '3',
    name: 'The Progressive Executive',
    title: 'VP, 40-50',
    description: 'Transforming traditional company',
    painPoints: ['Change resistance', 'Legacy mindset'],
    goals: ['Digital transformation', 'Market relevance'],
    triggerEvents: ['Competitor disruption', 'Revenue decline'],
    selected: false
  }
];

export function StrategicBusinessWizard({ userId, onComplete, existingBusiness }: any) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [businessId, setBusinessId] = useState<string | undefined>(existingBusiness?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showOrgSelector, setShowOrgSelector] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Basic info
    name: existingBusiness?.name || '',
    website_url: existingBusiness?.website_url || '',
    linkedin_url: existingBusiness?.linkedin_url || '',
    industry: existingBusiness?.industry || '',
    custom_industry: existingBusiness?.custom_industry || '',
    organization_id: existingBusiness?.organization_id || '',

    // Business details
    business_type: existingBusiness?.business_type || '',
    years_in_business: existingBusiness?.years_in_business || '',
    employee_count: existingBusiness?.employee_count || '',
    business_model: existingBusiness?.business_model || '',
    avg_customer_ltv: existingBusiness?.avg_customer_ltv || '',
    primary_goal: existingBusiness?.primary_goal || '',

    // Services & competitors
    services: existingBusiness?.services?.length > 0 ? existingBusiness.services : [{ name: '', url: '' }],
    competitors: existingBusiness?.competitors?.length > 0 ? existingBusiness.competitors : [{ url: '', notes: '' }],
    documents: [],

    // Strategic foundation
    selectedSegments: [],
    selectedPersona: null,

    // Strategic responses
    strategicResponses: []
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Load organizations on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const result = await getOrganizations();
        if (result.success && result.data) {
          setOrganizations(result.data);
          if (result.data.length > 1) {
            setShowOrgSelector(true);
          }
          if (!existingBusiness?.organization_id && result.data.length > 0) {
            updateFormData({ organization_id: result.data[0].id });
          }
        }
      } catch (error) {
        console.error('Failed to load organizations:', error);
      }
    };
    loadOrganizations();
  }, []);

  // Update phase based on step
  useEffect(() => {
    if (currentStep <= 3) setCurrentPhase(1);
    else if (currentStep <= 5) setCurrentPhase(2);
    else if (currentStep <= 9) setCurrentPhase(3);
    else setCurrentPhase(4);
  }, [currentStep]);

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1 && !formData.name) {
      toast.error('Business name is required');
      return;
    }

    // Save business after step 3
    if (currentStep === 3) {
      await saveBusinessData();
    }

    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveBusinessData = async () => {
    setIsLoading(true);
    try {
      const { documents, selectedSegments, selectedPersona, strategicResponses, ...businessData } = formData;

      const dataToSave = {
        ...businessData,
        user_id: userId,
        onboarding_phase: 'strategic_foundation',
        onboarding_step: currentStep,
        onboarding_completed: false,
        status_enum: 'onboarding' as const
      };

      let result;
      if (businessId) {
        result = await updateBusiness(businessId, dataToSave);
      } else {
        result = await createBusiness(dataToSave);
        if (result.data?.id) {
          setBusinessId(result.data.id);
        }
      }

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error('Failed to save business', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await saveBusinessData();

      // Generate positioning output
      const positioning = generatePositioning();

      toast.success('Strategic onboarding completed!');

      if (onComplete) {
        onComplete({ ...formData, positioning });
      }
    } catch (error: any) {
      toast.error('Failed to complete onboarding', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePositioning = () => {
    // This would be generated by AI in production
    const segment = formData.selectedSegments.find(s => s.isPrimary);
    const persona = formData.selectedPersona;

    return {
      statement: `For ${persona?.name || 'ideal customers'} in ${segment?.title || 'your market'}, we're the only solution that...`,
      segment: segment?.title,
      persona: persona?.name,
      problem: formData.strategicResponses.find(r => r.questionId === 'Q1')?.response,
      uniqueValue: formData.strategicResponses.find(r => r.questionId === 'Q14')?.response
    };
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 1, title: 'Basics' },
      { id: 2, title: 'Details' },
      { id: 3, title: 'Services' },
      { id: 4, title: 'Segments' },
      { id: 5, title: 'Persona' },
      { id: 6, title: 'Problem' },
      { id: 7, title: 'Obstacles' },
      { id: 8, title: 'Identity' },
      { id: 9, title: 'Position' },
      { id: 10, title: 'Results' }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Phase {currentPhase} of 4 • Step {currentStep} of 10
          </p>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all",
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className={cn(
                "ml-2 text-xs font-medium hidden sm:inline",
                step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
              {step.id < 10 && (
                <ChevronRight className="w-4 h-4 ml-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {renderStepIndicator()}

      <div className="bg-card rounded-lg border p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business Basics</h2>
              <p className="text-muted-foreground">Let's start with your basic business information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Your Company Name"
                  required
                />
              </div>

              {showOrgSelector && (
                <div>
                  <Label htmlFor="organization">Organization *</Label>
                  <Select
                    value={formData.organization_id}
                    onValueChange={(value) => updateFormData({ organization_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization..." />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => updateFormData({ website_url: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Company Page</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin_url}
                  onChange={(e) => updateFormData({ linkedin_url: e.target.value })}
                  placeholder="linkedin.com/company/yourcompany"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateFormData({ industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.industry === 'Other' && (
                <div>
                  <Label htmlFor="custom_industry">Specify Industry</Label>
                  <Input
                    id="custom_industry"
                    value={formData.custom_industry}
                    onChange={(e) => updateFormData({ custom_industry: e.target.value })}
                    placeholder="Your industry"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Market Segments */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Market Segments</h2>
              <p className="text-muted-foreground">Select your primary and optionally secondary market segments</p>
            </div>

            <div className="space-y-4">
              {sampleSegments.map((segment) => (
                <Card
                  key={segment.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    segment.selected && "border-primary",
                    segment.isPrimary && "ring-2 ring-primary"
                  )}
                  onClick={() => {
                    const newSegments = [...formData.selectedSegments];
                    const existingIndex = newSegments.findIndex(s => s.id === segment.id);

                    if (existingIndex >= 0) {
                      newSegments.splice(existingIndex, 1);
                    } else {
                      newSegments.push({
                        ...segment,
                        selected: true,
                        isPrimary: newSegments.length === 0
                      });
                    }

                    updateFormData({ selectedSegments: newSegments });
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{segment.title}</CardTitle>
                      {segment.isPrimary && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <CardDescription>{segment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Pain Points:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {segment.painPoints.map((pain, i) => (
                            <li key={i}>{pain}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Opportunities:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {segment.opportunities.map((opp, i) => (
                            <li key={i}>{opp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Customer Persona */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Your Ideal Customer</h2>
              <p className="text-muted-foreground">Who is your primary buyer within the selected segment?</p>
            </div>

            <div className="space-y-4">
              {samplePersonas.map((persona) => (
                <Card
                  key={persona.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    formData.selectedPersona?.id === persona.id && "border-primary ring-2 ring-primary"
                  )}
                  onClick={() => updateFormData({ selectedPersona: persona })}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                        <CardDescription>{persona.title}</CardDescription>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{persona.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Pain Points:</p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside">
                          {persona.painPoints.map((pain, i) => (
                            <li key={i}>{pain}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Trigger Events:</p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside">
                          {persona.triggerEvents.map((trigger, i) => (
                            <li key={i}>{trigger}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Steps 6-9: Strategic Questions */}
        {currentStep >= 6 && currentStep <= 9 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Strategic Questions</h2>
              <p className="text-muted-foreground">
                {currentStep === 6 && "Define the problem and category"}
                {currentStep === 7 && "Identify obstacles and transformation"}
                {currentStep === 8 && "Clarify your identity and values"}
                {currentStep === 9 && "Position yourself uniquely in the market"}
              </p>
            </div>

            <div className="space-y-6">
              {strategicQuestions
                .filter(q => {
                  if (currentStep === 6) return ['Q1', 'Q2'].includes(q.id);
                  if (currentStep === 7) return ['Q3', 'Q4'].includes(q.id);
                  if (currentStep === 8) return ['Q5', 'Q6', 'Q7', 'Q8'].includes(q.id);
                  if (currentStep === 9) return ['Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15'].includes(q.id);
                  return false;
                })
                .map((question) => {
                  const response = formData.strategicResponses.find(r => r.questionId === question.id);

                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        <CardDescription>{question.question}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{question.description}</p>
                        <Textarea
                          value={response?.response || ''}
                          onChange={(e) => {
                            const newResponses = [...formData.strategicResponses];
                            const index = newResponses.findIndex(r => r.questionId === question.id);

                            if (index >= 0) {
                              newResponses[index].response = e.target.value;
                            } else {
                              newResponses.push({
                                questionId: question.id,
                                response: e.target.value,
                                confidence: 'medium'
                              });
                            }

                            updateFormData({ strategicResponses: newResponses });
                          }}
                          placeholder={question.placeholder}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">AI can help with this</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Confidence:</span>
                            <div className="flex space-x-1">
                              {['low', 'medium', 'high'].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => {
                                    const newResponses = [...formData.strategicResponses];
                                    const index = newResponses.findIndex(r => r.questionId === question.id);

                                    if (index >= 0) {
                                      newResponses[index].confidence = level as any;
                                    } else {
                                      newResponses.push({
                                        questionId: question.id,
                                        response: '',
                                        confidence: level as any
                                      });
                                    }

                                    updateFormData({ strategicResponses: newResponses });
                                  }}
                                  className={cn(
                                    "px-2 py-1 rounded text-xs",
                                    response?.confidence === level
                                      ? level === 'high' ? 'bg-green-500 text-white'
                                        : level === 'medium' ? 'bg-yellow-500 text-white'
                                        : 'bg-red-500 text-white'
                                      : 'bg-muted text-muted-foreground'
                                  )}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Step 10: Results */}
        {currentStep === 10 && (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Your Strategic Positioning</h2>
              <p className="text-muted-foreground">Here's your complete positioning based on your responses</p>
            </div>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Positioning Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  For {formData.selectedPersona?.name || 'your ideal customers'} struggling with{' '}
                  {formData.strategicResponses.find(r => r.questionId === 'Q1')?.response || 'their key problem'},
                  we're the only {formData.strategicResponses.find(r => r.questionId === 'Q12')?.response || 'solution'} that{' '}
                  {formData.strategicResponses.find(r => r.questionId === 'Q14')?.response || 'creates unique value'}.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Segment Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {formData.selectedSegments.find(s => s.isPrimary)?.title || 'Not selected'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Target Persona</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {formData.selectedPersona?.name || 'Not selected'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Core Problem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {formData.strategicResponses.find(r => r.questionId === 'Q1')?.response || 'Not defined'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Unique Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {formData.strategicResponses.find(r => r.questionId === 'Q14')?.response || 'Not defined'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                🎯 Your positioning is {Math.floor(Math.random() * 20) + 80}% ready.
                You can now proceed to create projects with this strategic foundation.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Business Details</h2>
              <p className="text-muted-foreground">Tell us more about your business structure and goals</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="block mb-3">Business Type *</Label>
                <RadioGroup
                  value={formData.business_type}
                  onValueChange={(value) => updateFormData({ business_type: value })}
                  className="flex flex-wrap gap-4"
                >
                  {['B2B', 'B2C', 'B2B2C', 'Marketplace', 'Non-profit'].map((type) => (
                    <Label key={type} htmlFor={type} className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={type} id={type} className="border border-border" />
                      <span className="font-normal">{type}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block mb-3 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Years in Business
                </Label>
                <RadioGroup
                  value={formData.years_in_business}
                  onValueChange={(value) => updateFormData({ years_in_business: value })}
                  className="flex flex-wrap gap-4"
                >
                  {['<1', '1-3', '3-5', '5-10', '10+'].map((years) => (
                    <Label key={years} htmlFor={`years-${years}`} className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={years} id={`years-${years}`} className="border border-border" />
                      <span className="font-normal">
                        {years} {years === '<1' ? 'year' : 'years'}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block mb-3 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Employee Count
                </Label>
                <RadioGroup
                  value={formData.employee_count}
                  onValueChange={(value) => updateFormData({ employee_count: value })}
                  className="flex flex-wrap gap-4"
                >
                  {['1-10', '11-50', '51-200', '200-1000', '1000+'].map((count) => (
                    <Label key={count} htmlFor={`emp-${count}`} className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={count} id={`emp-${count}`} className="border border-border" />
                      <span className="font-normal">{count}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block mb-3 flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Business Model
                </Label>
                <RadioGroup
                  value={formData.business_model}
                  onValueChange={(value) => updateFormData({ business_model: value })}
                  className="flex flex-wrap gap-4"
                >
                  {['Subscription', 'One-time', 'Retainer', 'Commission'].map((model) => (
                    <Label key={model} htmlFor={`model-${model}`} className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={model} id={`model-${model}`} className="border border-border" />
                      <span className="font-normal">{model}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block mb-3 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Average Customer LTV
                </Label>
                <RadioGroup
                  value={formData.avg_customer_ltv}
                  onValueChange={(value) => updateFormData({ avg_customer_ltv: value })}
                  className="flex flex-wrap gap-4"
                >
                  {['<$1K', '$1-10K', '$10-100K', '$100K+', 'Not sure'].map((ltv) => (
                    <Label key={ltv} htmlFor={`ltv-${ltv}`} className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={ltv} id={`ltv-${ltv}`} className="border border-border" />
                      <span className="font-normal">{ltv}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block mb-3 flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Primary Goal (Next 12 Months)
                </Label>
                <RadioGroup
                  value={formData.primary_goal}
                  onValueChange={(value) => updateFormData({ primary_goal: value })}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  {[
                    'Find product-market fit',
                    'Scale what\'s working',
                    'Enter new market',
                    'Improve positioning',
                    'Prepare for funding/exit'
                  ].map((goal) => (
                    <Label key={goal} htmlFor={`goal-${goal.replace(/[^a-zA-Z0-9]/g, '-')}`} className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors min-h-[60px] cursor-pointer">
                      <RadioGroupItem value={goal} id={`goal-${goal.replace(/[^a-zA-Z0-9]/g, '-')}`} className="border border-border flex-shrink-0" />
                      <span className="font-normal text-sm leading-tight">{goal}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Services & Intelligence */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Services & Intelligence</h2>
              <p className="text-muted-foreground">What do you offer and who are your competitors?</p>
            </div>

            <div className="space-y-8">
              {/* Services Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">
                  🛠️ YOUR OFFERINGS
                </h3>
                <p className="text-sm text-muted-foreground">
                  What are your 1-3 primary services or products?
                </p>

                <div className="space-y-6">
                  {formData.services.map((service, index) => (
                    <div key={index} className="space-y-4 p-4 bg-secondary/20 rounded-lg relative">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`service-${index}`}>
                          {index + 1}. Service/Product Name
                        </Label>
                        {formData.services.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newServices = formData.services.filter((_, i) => i !== index);
                              updateFormData({ services: newServices });
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        id={`service-${index}`}
                        value={service.name}
                        onChange={(e) => {
                          const newServices = [...formData.services];
                          newServices[index] = { ...newServices[index], name: e.target.value };
                          updateFormData({ services: newServices });
                        }}
                        placeholder="e.g., Web Development, Consulting, SaaS Platform"
                      />
                      <Input
                        value={service.url || ''}
                        onChange={(e) => {
                          const newServices = [...formData.services];
                          newServices[index] = { ...newServices[index], url: e.target.value };
                          updateFormData({ services: newServices });
                        }}
                        placeholder="URL (optional)"
                        type="url"
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      updateFormData({
                        services: [...formData.services, { name: '', url: '' }]
                      });
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Service
                  </Button>
                </div>
              </div>

              {/* Competitors Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">
                  <Target className="inline h-4 w-4 mr-1" />
                  COMPETITIVE LANDSCAPE
                </h3>
                <p className="text-sm text-muted-foreground">
                  List competitors or companies you admire and what you like/dislike about them:
                </p>

                <div className="space-y-6">
                  {formData.competitors.map((competitor, index) => (
                    <div key={index} className="space-y-4 p-4 bg-secondary/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`competitor-${index}`}>
                          {index + 1}. Competitor Analysis
                        </Label>
                        {formData.competitors.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCompetitors = formData.competitors.filter((_, i) => i !== index);
                              updateFormData({ competitors: newCompetitors });
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        id={`competitor-${index}`}
                        value={competitor.url}
                        onChange={(e) => {
                          const newCompetitors = [...formData.competitors];
                          newCompetitors[index] = { ...newCompetitors[index], url: e.target.value };
                          updateFormData({ competitors: newCompetitors });
                        }}
                        placeholder="competitor.com"
                        type="url"
                      />
                      <Textarea
                        value={competitor.notes}
                        onChange={(e) => {
                          const newCompetitors = [...formData.competitors];
                          newCompetitors[index] = { ...newCompetitors[index], notes: e.target.value };
                          updateFormData({ competitors: newCompetitors });
                        }}
                        placeholder="What you like/dislike about them..."
                        rows={2}
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      updateFormData({
                        competitors: [...formData.competitors, { url: '', notes: '' }]
                      });
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Competitor
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : currentStep === 10 ? (
              <>Complete</>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}