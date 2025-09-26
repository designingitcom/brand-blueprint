'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SegmentSelection } from './segment-selection';
import { PersonaSelection } from './persona-selection';
import { StrategicQuestionsFlow } from './strategic-questions-flow';
import { PositioningOutput } from './positioning-output';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  updateOnboardingProgress,
  saveStrategicResponse,
  savePositioningOutput,
  MarketSegment,
  BuyerPersona,
  StrategicQuestionResponse,
  PositioningOutput as PositioningOutputType,
} from '@/app/actions/businesses';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Target,
  User,
  Brain,
  Award,
  Sparkles,
  Users,
  Calendar,
  Package,
  DollarSign,
  Plus,
  X,
  Upload,
  FileText,
  Edit,
} from 'lucide-react';

type OnboardingPhase =
  | 'business_setup'
  | 'strategic_foundation'
  | 'strategic_questions'
  | 'positioning_output'
  | 'completed';

interface ComprehensiveOnboardingWizardProps {
  userId: string;
  businessId?: string;
  existingBusiness?: any;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: any) => void;
}

export function ComprehensiveOnboardingWizard({
  userId,
  businessId,
  existingBusiness,
  isOpen,
  onClose,
  onComplete,
}: ComprehensiveOnboardingWizardProps) {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] =
    useState<OnboardingPhase>('business_setup');
  const [businessData, setBusinessData] = useState(existingBusiness || null);
  const [selectedSegment, setSelectedSegment] = useState<MarketSegment | null>(
    null
  );
  const [selectedPersona, setSelectedPersona] = useState<BuyerPersona | null>(
    null
  );
  const [strategicResponses, setStrategicResponses] = useState<
    Record<string, StrategicQuestionResponse>
  >({});
  const [positioningData, setPositioningData] =
    useState<PositioningOutputType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [businessSetupStep, setBusinessSetupStep] = useState(1);
  const [businessDetailsSubStep, setBusinessDetailsSubStep] = useState(1);
  const [servicesStep, setServicesStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Business Basics
    name: '',
    website: '',
    linkedin: '',
    industry: '',
    customIndustry: '',
    // Step 2 - Business Details
    businessType: '',
    yearsInBusiness: '',
    employeeCount: '',
    businessModel: '',
    avgCustomerLTV: '',
    primaryGoal: '',
    // Step 3 - Services & Intelligence
    services: [{ name: '', url: '' }],
    competitors: [{ url: '', notes: '' }],
    documents: [],
  });

  const getBusinessSetupDescription = () => {
    switch (businessSetupStep) {
      case 1:
        return 'Step 1/3: Business Basics';
      case 2:
        return 'Step 2/3: Structure & Goals';
      case 3:
        return 'Step 3/3: Services & Intelligence';
      default:
        return 'Business Information';
    }
  };

  const phases = [
    {
      key: 'business_setup',
      title: '1. Business Setup',
      icon: Target,
      description: getBusinessSetupDescription(),
    },
    {
      key: 'strategic_foundation',
      title: '2. Strategic Foundation',
      icon: User,
      description: 'Market segments & personas',
    },
    {
      key: 'strategic_questions',
      title: '3. Strategic Questions',
      icon: Brain,
      description: '15 positioning questions',
    },
    {
      key: 'positioning_output',
      title: '4. Positioning Output',
      icon: Award,
      description: 'Your strategic positioning',
    },
  ];

  const currentPhaseIndex = phases.findIndex(p => p.key === currentPhase);
  const progressPercentage = ((currentPhaseIndex + 1) / phases.length) * 100;
  const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);

  // Calculate overall progress across all questions
  const getOverallProgress = () => {
    let totalQuestions = 0;
    let completedQuestions = 0;

    // Phase 1: Business Setup (9 total questions/steps)
    // Step 1: 1 step (business basics form)
    // Step 2: 6 questions (business details)
    // Step 3: 3 sections (services, competitors, documents)
    const businessSetupTotal = 10;
    if (currentPhase === 'business_setup') {
      if (businessSetupStep === 1) {
        completedQuestions = 0;
      } else if (businessSetupStep === 2) {
        completedQuestions = 1 + (businessDetailsSubStep - 1);
      } else if (businessSetupStep === 3) {
        completedQuestions = 7 + (servicesStep - 1);
      }
    } else if (currentPhaseIndex > 0) {
      completedQuestions = businessSetupTotal;
    }

    // Phase 2: Strategic Foundation (2 steps - segments + personas)
    const strategicFoundationTotal = 2;
    if (currentPhase === 'strategic_foundation') {
      if (selectedSegment && selectedPersona) {
        completedQuestions += strategicFoundationTotal;
      } else if (selectedSegment) {
        completedQuestions += 1;
      }
    } else if (currentPhaseIndex > 1) {
      completedQuestions += strategicFoundationTotal;
    }

    // Phase 3: Strategic Questions (15 questions)
    const strategicQuestionsTotal = 15;
    if (currentPhase === 'strategic_questions') {
      // Add completed strategic questions (would need to track this from the component)
      completedQuestions += Object.keys(strategicResponses || {}).length;
    } else if (currentPhaseIndex > 2) {
      completedQuestions += strategicQuestionsTotal;
    }

    // Phase 4: Positioning Output (1 final step)
    const positioningOutputTotal = 1;
    if (currentPhase === 'positioning_output') {
      completedQuestions += positioningOutputTotal;
    }

    totalQuestions =
      businessSetupTotal +
      strategicFoundationTotal +
      strategicQuestionsTotal +
      positioningOutputTotal;

    return {
      current: Math.min(completedQuestions, totalQuestions),
      total: totalQuestions,
      percentage: Math.round((completedQuestions / totalQuestions) * 100),
    };
  };

  const overallProgress = getOverallProgress();

  // Update progress tracking
  const updateProgress = async (phase: OnboardingPhase, step?: number) => {
    if (!businessData?.id) return;

    try {
      await updateOnboardingProgress(businessData.id, phase, step, {
        total_time_minutes: elapsedMinutes,
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Handle business setup completion
  const handleBusinessSetupComplete = async (business: any) => {
    setBusinessData(business);
    setCurrentPhase('strategic_foundation');
    await updateProgress('strategic_foundation');
    toast.success('Business setup completed!');
  };

  // Handle segment selection
  const handleSegmentSelected = async (
    primary: MarketSegment,
    secondary?: MarketSegment
  ) => {
    setSelectedSegment(primary);
    // Stay in strategic_foundation phase, just move to persona selection
    await updateProgress('strategic_foundation');
    toast.success('Market segment selected!');
  };

  // Handle persona selection
  const handlePersonaSelected = async (
    persona: BuyerPersona,
    customizations?: string
  ) => {
    setSelectedPersona({ ...persona, customizations });
    setCurrentPhase('strategic_questions');
    await updateProgress('strategic_questions', 0);
    toast.success('Buyer persona selected!');
  };

  // Handle strategic questions completion
  const handleQuestionsCompleted = async (
    responses: Record<string, StrategicQuestionResponse>
  ) => {
    setIsLoading(true);
    setStrategicResponses(responses);

    try {
      // Save all responses
      for (const [questionId, response] of Object.entries(responses)) {
        await saveStrategicResponse(businessData.id, questionId, response);
      }

      setCurrentPhase('positioning_output');
      await updateProgress('strategic_questions', 15);
      toast.success('Strategic questions completed!');
    } catch (error) {
      console.error('Failed to save responses:', error);
      toast.error('Failed to save responses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle positioning completion
  const handlePositioningComplete = async (
    positioning: PositioningOutputType
  ) => {
    setIsLoading(true);
    setPositioningData(positioning);

    try {
      await savePositioningOutput(businessData.id, positioning);
      setCurrentPhase('completed');
      await updateProgress('completed');

      toast.success('Strategic positioning completed!', {
        description: 'Your comprehensive positioning strategy is ready.',
        duration: 5000,
      });

      // Complete the onboarding
      setTimeout(() => {
        if (onComplete) {
          onComplete({ business: businessData, positioning });
        } else {
          router.push('/dashboard');
        }
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to save positioning:', error);
      toast.error('Failed to save positioning. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going back
  const handlePrevious = () => {
    const phases: OnboardingPhase[] = [
      'business_setup',
      'strategic_foundation',
      'strategic_questions',
      'positioning_output',
    ];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
  };

  // Handle phase navigation
  const handlePhaseNavigation = (targetPhase: OnboardingPhase) => {
    const phases: OnboardingPhase[] = [
      'business_setup',
      'strategic_foundation',
      'strategic_questions',
      'positioning_output',
    ];
    const currentIndex = phases.indexOf(currentPhase);
    const targetIndex = phases.indexOf(targetPhase);

    // Only allow navigation to current or completed phases
    if (targetIndex <= currentIndex) {
      setCurrentPhase(targetPhase);
    }
  };

  // Check if phase navigation is allowed
  const isPhaseNavigationAllowed = (targetPhase: OnboardingPhase) => {
    const phases: OnboardingPhase[] = [
      'business_setup',
      'strategic_foundation',
      'strategic_questions',
      'positioning_output',
    ];
    const currentIndex = phases.indexOf(currentPhase);
    const targetIndex = phases.indexOf(targetPhase);

    return targetIndex <= currentIndex;
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'business_setup':
        return (
          <div className="space-y-6">
            {businessSetupStep === 1 && (
              <div className="space-y-8">
                {/* Step Header */}
                <div className="space-y-4">
                  <h2 className="text-base font-medium text-primary">
                    Step 1/3: Business Basics
                  </h2>
                  <p className="text-muted-foreground">
                    Let's start with your basic business information
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your Company Name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={e =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin">LinkedIn Company Page</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={e =>
                        setFormData({ ...formData, linkedin: e.target.value })
                      }
                      placeholder="linkedin.com/company/yourcompany"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={value =>
                        setFormData({ ...formData, industry: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Transportation">
                          Transportation
                        </SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Telecommunications">
                          Telecommunications
                        </SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Construction">
                          Construction
                        </SelectItem>
                        <SelectItem value="Hospitality">Hospitality</SelectItem>
                        <SelectItem value="Legal Services">
                          Legal Services
                        </SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.industry === 'Other' && (
                    <div>
                      <Label htmlFor="customIndustry">Specify Industry</Label>
                      <Input
                        id="customIndustry"
                        value={formData.customIndustry}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            customIndustry: e.target.value,
                          })
                        }
                        placeholder="Enter your industry"
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        if (!formData.name || !formData.industry) {
                          toast.error('Please fill in required fields');
                          return;
                        }
                        setBusinessSetupStep(2);
                      }}
                    >
                      Continue to Business Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {businessSetupStep === 2 && (
              <div className="space-y-8">
                {/* Step Header with Progress */}
                <div className="space-y-4">
                  <h2 className="text-base font-medium text-primary">
                    Step 2/3: Structure & Goals
                  </h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Question {businessDetailsSubStep} of 6</span>
                      <span>
                        {Math.round((businessDetailsSubStep / 6) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(businessDetailsSubStep / 6) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Question 1: Business Type */}
                {businessDetailsSubStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2 text-center">
                      <h2 className="text-3xl font-bold">
                        What type of business do you run?
                      </h2>
                      <p className="text-muted-foreground">
                        Choose the model that best describes your business
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {[
                        {
                          value: 'B2B',
                          label: 'B2B',
                          description: 'Business to Business',
                        },
                        {
                          value: 'B2C',
                          label: 'B2C',
                          description: 'Business to Consumer',
                        },
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
                        {
                          value: 'Non-profit',
                          label: 'Non-profit',
                          description: 'Mission-driven organization',
                        },
                      ].map(type => (
                        <div
                          key={type.value}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              businessType: type.value,
                            });
                            setTimeout(() => setBusinessDetailsSubStep(2), 300);
                          }}
                          className={cn(
                            'p-6 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                            formData.businessType === type.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          )}
                        >
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">
                              {type.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBusinessSetupStep(1)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Business Basics
                      </Button>
                    </div>
                  </div>
                )}

                {/* Question 2: Years in Business */}
                {businessDetailsSubStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2 text-center">
                      <h2 className="text-3xl font-bold">
                        How long have you been in business?
                      </h2>
                      <p className="text-muted-foreground">
                        This helps us understand your business maturity
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                      {[
                        {
                          value: '<1',
                          label: '<1 year',
                          description: 'Just starting out',
                        },
                        {
                          value: '1-3',
                          label: '1-3 years',
                          description: 'Early stage',
                        },
                        {
                          value: '3-5',
                          label: '3-5 years',
                          description: 'Growth stage',
                        },
                        {
                          value: '5-10',
                          label: '5-10 years',
                          description: 'Established',
                        },
                        {
                          value: '10+',
                          label: '10+ years',
                          description: 'Mature business',
                        },
                      ].map(years => (
                        <div
                          key={years.value}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              yearsInBusiness: years.value,
                            });
                            setTimeout(() => setBusinessDetailsSubStep(3), 300);
                          }}
                          className={cn(
                            'p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                            formData.yearsInBusiness === years.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          )}
                        >
                          <div className="space-y-1">
                            <h3 className="font-semibold">{years.label}</h3>
                            <p className="text-xs text-muted-foreground">
                              {years.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBusinessDetailsSubStep(1)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Question
                      </Button>
                    </div>
                  </div>
                )}

                {/* Question 3: Employee Count */}
                {businessDetailsSubStep === 3 && (
                  <div className="space-y-6 text-center">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">
                        How many employees do you have?
                      </h2>
                      <p className="text-muted-foreground">
                        Including yourself and any contractors
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                      {[
                        {
                          value: '1-10',
                          label: '1-10',
                          description: 'Small team',
                        },
                        {
                          value: '11-50',
                          label: '11-50',
                          description: 'Growing team',
                        },
                        {
                          value: '51-200',
                          label: '51-200',
                          description: 'Mid-size company',
                        },
                        {
                          value: '200-1000',
                          label: '200-1000',
                          description: 'Large company',
                        },
                        {
                          value: '1000+',
                          label: '1000+',
                          description: 'Enterprise',
                        },
                      ].map(count => (
                        <div
                          key={count.value}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              employeeCount: count.value,
                            });
                            setTimeout(() => setBusinessDetailsSubStep(4), 300);
                          }}
                          className={cn(
                            'p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                            formData.employeeCount === count.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          )}
                        >
                          <div className="space-y-1">
                            <h3 className="font-semibold">{count.label}</h3>
                            <p className="text-xs text-muted-foreground">
                              {count.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBusinessDetailsSubStep(2)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Question
                      </Button>
                    </div>
                  </div>
                )}

                {/* Question 4: Business Model */}
                {businessDetailsSubStep === 4 && (
                  <div className="space-y-6 text-center">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">
                        What's your business model?
                      </h2>
                      <p className="text-muted-foreground">
                        How do you typically charge for your services?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                      {[
                        {
                          value: 'Subscription',
                          label: 'Subscription',
                          description: 'Recurring monthly/yearly fees',
                        },
                        {
                          value: 'One-time',
                          label: 'One-time',
                          description: 'Project-based pricing',
                        },
                        {
                          value: 'Retainer',
                          label: 'Retainer',
                          description: 'Monthly retainer agreements',
                        },
                        {
                          value: 'Commission',
                          label: 'Commission',
                          description: 'Performance-based fees',
                        },
                      ].map(model => (
                        <div
                          key={model.value}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              businessModel: model.value,
                            });
                            setTimeout(() => setBusinessDetailsSubStep(5), 300);
                          }}
                          className={cn(
                            'p-6 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                            formData.businessModel === model.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          )}
                        >
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">
                              {model.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {model.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBusinessDetailsSubStep(3)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Question
                      </Button>
                    </div>
                  </div>
                )}

                {/* Question 5: Customer LTV */}
                {businessDetailsSubStep === 5 && (
                  <div className="space-y-6 text-center">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">
                        What's your average customer lifetime value?
                      </h2>
                      <p className="text-muted-foreground">
                        Total revenue you expect from a typical customer
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                      {[
                        {
                          value: '<$1K',
                          label: '<$1K',
                          description: 'Low-touch customers',
                        },
                        {
                          value: '$1-10K',
                          label: '$1-10K',
                          description: 'Standard customers',
                        },
                        {
                          value: '$10-100K',
                          label: '$10-100K',
                          description: 'Premium customers',
                        },
                        {
                          value: '$100K+',
                          label: '$100K+',
                          description: 'Enterprise clients',
                        },
                        {
                          value: 'Not sure',
                          label: 'Not sure',
                          description: 'Still figuring it out',
                        },
                      ].map(ltv => (
                        <div
                          key={ltv.value}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              avgCustomerLTV: ltv.value,
                            });
                            setTimeout(() => setBusinessDetailsSubStep(6), 300);
                          }}
                          className={cn(
                            'p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                            formData.avgCustomerLTV === ltv.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          )}
                        >
                          <div className="space-y-1">
                            <h3 className="font-semibold">{ltv.label}</h3>
                            <p className="text-xs text-muted-foreground">
                              {ltv.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBusinessDetailsSubStep(4)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Question
                      </Button>
                    </div>
                  </div>
                )}

                {/* Question 6: Primary Goal */}
                {businessDetailsSubStep === 6 && (
                  <div className="space-y-6 text-center">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">
                        What's your primary goal for the next 12 months?
                      </h2>
                      <p className="text-muted-foreground">
                        Choose the most important objective for your business
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {[
                        {
                          value: 'Find product-market fit',
                          label: 'Find product-market fit',
                          description: 'Validate and refine your offering',
                        },
                        {
                          value: "Scale what's working",
                          label: "Scale what's working",
                          description: 'Grow proven business model',
                        },
                        {
                          value: 'Enter new market',
                          label: 'Enter new market',
                          description: 'Expand to new segments',
                        },
                        {
                          value: 'Improve positioning',
                          label: 'Improve positioning',
                          description: 'Clarify your value proposition',
                        },
                        {
                          value: 'Prepare for funding/exit',
                          label: 'Prepare for funding/exit',
                          description: 'Get ready for investment or sale',
                        },
                      ].map(goal => (
                        <div
                          key={goal.value}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              primaryGoal: goal.value,
                            });
                            setTimeout(() => setBusinessSetupStep(3), 300);
                          }}
                          className={cn(
                            'p-6 rounded-lg border-2 cursor-pointer transition-all hover:scale-105',
                            formData.primaryGoal === goal.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          )}
                        >
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">
                              {goal.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-start pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBusinessDetailsSubStep(5)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Question
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                {/* Progress indicator for Step 2 */}
                <div className="flex justify-center items-center gap-2 pt-6">
                  {[1, 2, 3, 4, 5, 6].map(step => (
                    <div
                      key={step}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        step <= businessDetailsSubStep
                          ? 'bg-primary'
                          : 'bg-border'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {businessSetupStep === 3 && (
              <div className="space-y-8">
                {/* Step Header with Progress */}
                <div className="space-y-4">
                  <h2 className="text-base font-medium text-primary">
                    Step 3/3: Services & Intelligence
                  </h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Section {servicesStep} of 3</span>
                      <span>{Math.round((servicesStep / 3) * 100)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(servicesStep / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Services Section */}
                {servicesStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">
                      🛠️ YOUR OFFERINGS
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      What are your 1-3 primary services or products?
                    </p>
                    <div className="space-y-6">
                      {formData.services.map((service, index) => (
                        <div
                          key={index}
                          className="space-y-4 p-4 bg-secondary/20 rounded-lg relative"
                        >
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
                                  const newServices = formData.services.filter(
                                    (_, i) => i !== index
                                  );
                                  setFormData({
                                    ...formData,
                                    services: newServices,
                                  });
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
                            onChange={e => {
                              const newServices = [...formData.services];
                              newServices[index] = {
                                ...newServices[index],
                                name: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                services: newServices,
                              });
                            }}
                            placeholder="e.g., Web Development, Consulting, SaaS Platform"
                          />
                          <Input
                            value={service.url || ''}
                            onChange={e => {
                              const newServices = [...formData.services];
                              newServices[index] = {
                                ...newServices[index],
                                url: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                services: newServices,
                              });
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
                          setFormData({
                            ...formData,
                            services: [
                              ...formData.services,
                              { name: '', url: '' },
                            ],
                          });
                        }}
                        className="w-full flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Service
                      </Button>
                    </div>
                    <div className="flex justify-between mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setBusinessSetupStep(2)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Structure & Goals
                      </Button>
                      <Button
                        onClick={() => {
                          if (!formData.services.some(s => s.name.trim())) {
                            toast.error(
                              'Please add at least one service or product'
                            );
                            return;
                          }
                          setServicesStep(2);
                        }}
                      >
                        Continue to Competitors
                      </Button>
                    </div>
                  </div>
                )}

                {/* Competitors Section */}
                {servicesStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">
                      <Target className="inline h-4 w-4 mr-1" />
                      COMPETITIVE LANDSCAPE
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      List competitors or companies you admire and what you
                      like/dislike about them:
                    </p>
                    <div className="space-y-6">
                      {formData.competitors.map((competitor, index) => (
                        <div
                          key={index}
                          className="space-y-4 p-4 bg-secondary/10 rounded-lg"
                        >
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
                                  const newCompetitors =
                                    formData.competitors.filter(
                                      (_, i) => i !== index
                                    );
                                  setFormData({
                                    ...formData,
                                    competitors: newCompetitors,
                                  });
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
                            onChange={e => {
                              const newCompetitors = [...formData.competitors];
                              newCompetitors[index] = {
                                ...newCompetitors[index],
                                url: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                competitors: newCompetitors,
                              });
                            }}
                            placeholder="competitor.com"
                            type="url"
                          />
                          <Textarea
                            value={competitor.notes}
                            onChange={e => {
                              const newCompetitors = [...formData.competitors];
                              newCompetitors[index] = {
                                ...newCompetitors[index],
                                notes: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                competitors: newCompetitors,
                              });
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
                          setFormData({
                            ...formData,
                            competitors: [
                              ...formData.competitors,
                              { url: '', notes: '' },
                            ],
                          });
                        }}
                        className="w-full flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Competitor
                      </Button>
                    </div>
                    <div className="flex justify-between mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setServicesStep(1)}
                      >
                        Back to Services
                      </Button>
                      <Button onClick={() => setServicesStep(3)}>
                        Continue to Documents
                      </Button>
                    </div>
                  </div>
                )}

                {/* Document Upload Section */}
                {servicesStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">
                      <FileText className="inline h-4 w-4 mr-1" />
                      SUPPORTING DOCUMENTS
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload any relevant documents (pitch decks, marketing
                      materials, case studies, etc.) to help us understand your
                      business better.
                    </p>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Drop files here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, PPT, or images up to 10MB each
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          // Create a file input and trigger it
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.multiple = true;
                          input.accept =
                            '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg';
                          input.onchange = e => {
                            const files = Array.from(
                              (e.target as HTMLInputElement).files || []
                            );
                            const newDocuments = files.map(file => ({
                              name: file.name,
                              size: file.size,
                              type: file.type,
                              file: file,
                            }));
                            setFormData({
                              ...formData,
                              documents: [
                                ...formData.documents,
                                ...newDocuments,
                              ],
                            });
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>

                    {formData.documents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Uploaded Files:</p>
                        {formData.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{doc.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round(doc.size / 1024)}KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newDocuments = formData.documents.filter(
                                  (_, i) => i !== index
                                );
                                setFormData({
                                  ...formData,
                                  documents: newDocuments,
                                });
                              }}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setServicesStep(2)}
                      >
                        Back to Competitors
                      </Button>
                      <Button
                        onClick={() => {
                          if (!formData.services.some(s => s.name.trim())) {
                            toast.error(
                              'Please add at least one service or product'
                            );
                            return;
                          }
                          handleBusinessSetupComplete(formData);
                        }}
                      >
                        Continue to Strategic Foundation
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress indicator for Step 3 */}
                <div className="flex justify-center items-center gap-2 pt-6">
                  {[1, 2, 3].map(step => (
                    <div
                      key={step}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        step <= servicesStep ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'strategic_foundation':
        if (!businessData) return null;
        if (!selectedSegment) {
          return (
            <SegmentSelection
              businessData={businessData}
              onSegmentSelected={handleSegmentSelected}
              onPrevious={handlePrevious}
              isLoading={isLoading}
            />
          );
        }
        return (
          <PersonaSelection
            selectedSegment={selectedSegment}
            onPersonaSelected={handlePersonaSelected}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        );

      case 'strategic_questions':
        if (!selectedSegment || !selectedPersona) return null;
        return (
          <StrategicQuestionsFlow
            selectedSegment={selectedSegment}
            selectedPersona={selectedPersona}
            businessData={businessData}
            onQuestionsCompleted={handleQuestionsCompleted}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        );

      case 'positioning_output':
        if (
          !businessData ||
          !selectedSegment ||
          !selectedPersona ||
          !strategicResponses
        )
          return null;
        return (
          <PositioningOutput
            businessData={businessData}
            selectedSegment={selectedSegment}
            selectedPersona={selectedPersona}
            strategicResponses={strategicResponses}
            onComplete={() => handlePositioningComplete(positioningData!)}
            onShare={() => toast.info('Share functionality coming soon!')}
            onPrevious={handlePrevious}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto custom-scrollbar p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="space-y-4">
            {/* Title */}
            <DialogTitle className="sr-only">
              Comprehensive Business Onboarding
            </DialogTitle>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-medium">Add New Business</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Question {overallProgress.current}/{overallProgress.total} -{' '}
                  {overallProgress.percentage}%
                </div>
                {currentPhase !== 'business_setup' && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to start over? All progress will be lost.'
                        )
                      ) {
                        setCurrentPhase('business_setup');
                        setBusinessSetupStep(1);
                        setBusinessDetailsSubStep(1);
                        setServicesStep(1);
                        setSelectedSegment(null);
                        setSelectedPersona(null);
                        setStrategicResponses({});
                        setPositioningData(null);
                        setFormData({
                          name: '',
                          website: '',
                          linkedin: '',
                          industry: '',
                          customIndustry: '',
                          businessType: '',
                          yearsInBusiness: '',
                          employeeCount: '',
                          businessModel: '',
                          avgCustomerLTV: '',
                          primaryGoal: '',
                          services: [{ name: '', url: '' }],
                          competitors: [{ url: '', notes: '' }],
                          documents: [],
                        });
                        toast.success('Starting over - all data cleared');
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
                  >
                    Start Over
                  </button>
                )}
              </div>
            </div>

            {/* Phase Indicators */}
            <div className="flex items-center justify-between">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                const isCompleted = index < currentPhaseIndex;
                const isCurrent = index === currentPhaseIndex;
                const isUpcoming = index > currentPhaseIndex;
                const isNavigationAllowed = isPhaseNavigationAllowed(
                  phase.key as OnboardingPhase
                );

                return (
                  <div
                    key={phase.key}
                    className="flex flex-col items-center space-y-2 flex-1"
                  >
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={cn(
                            'flex-1 h-0.5 transition-colors',
                            isCompleted ? 'bg-primary' : 'bg-border'
                          )}
                        />
                      )}
                      <div className="relative">
                        <div
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                            isNavigationAllowed
                              ? 'cursor-pointer hover:scale-105'
                              : '',
                            isCompleted
                              ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/90'
                              : isCurrent
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background text-muted-foreground'
                          )}
                          onClick={() => {
                            if (isNavigationAllowed) {
                              handlePhaseNavigation(
                                phase.key as OnboardingPhase
                              );
                            }
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        {/* Pencil edit icon for completed phases */}
                        {isCompleted && (
                          <div
                            className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors"
                            onClick={() =>
                              handlePhaseNavigation(
                                phase.key as OnboardingPhase
                              )
                            }
                          >
                            <Edit className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      {index < phases.length - 1 && (
                        <div
                          className={cn(
                            'flex-1 h-0.5 transition-colors',
                            isCompleted || isCurrent
                              ? 'bg-primary'
                              : 'bg-border'
                          )}
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={cn(
                          'text-lg font-bold transition-colors',
                          isNavigationAllowed
                            ? 'cursor-pointer hover:text-primary'
                            : '',
                          isCurrent ? 'text-primary' : 'text-muted-foreground'
                        )}
                        onClick={() => {
                          if (isNavigationAllowed) {
                            handlePhaseNavigation(phase.key as OnboardingPhase);
                          }
                        }}
                      >
                        {phase.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">{renderCurrentPhase()}</div>
      </DialogContent>
    </Dialog>
  );
}
