'use client';

import React, { useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStartWizardProps {
  userId: string;
  onComplete: (result: any) => void;
  onClose: () => void;
}

interface FormData {
  businessName: string;
  website: string;
  industry: string;
  linkedinUrl: string;
  expensiveProblem: string;
  customerGoals: string;
  currentAlternatives: string;
  competitors: Array<{ name: string; url: string }>;
  uniqueApproach: string;
  whyChooseYou: string;
  successMetric: string;
  coreIdentity: string;
}

const steps = [
  { id: 1, title: 'Business Basics' },
  { id: 2, title: 'Problem & Goals' },
  { id: 3, title: 'Competition' },
  { id: 4, title: 'Differentiation' },
  { id: 5, title: 'Identity' },
];

export function QuickStartWizard({
  userId,
  onComplete,
  onClose,
}: QuickStartWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    website: '',
    industry: '',
    linkedinUrl: '',
    expensiveProblem: '',
    customerGoals: '',
    currentAlternatives: '',
    competitors: [
      { name: '', url: '' },
      { name: '', url: '' },
      { name: '', url: '' },
    ],
    uniqueApproach: '',
    whyChooseYou: '',
    successMetric: '',
    coreIdentity: '',
  });

  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the wizard
      onComplete({
        ...formData,
        selectedPath: 'quick-start',
        userId,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCompetitor = (
    index: number,
    field: 'name' | 'url',
    value: string
  ) => {
    const updatedCompetitors = [...formData.competitors];
    updatedCompetitors[index] = {
      ...updatedCompetitors[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      competitors: updatedCompetitors,
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.industry;
      case 2:
        return formData.expensiveProblem && formData.customerGoals;
      case 3:
        return (
          formData.currentAlternatives && formData.competitors.some(c => c.name)
        );
      case 4:
        return formData.uniqueApproach && formData.whyChooseYou;
      case 5:
        return formData.successMetric && formData.coreIdentity;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Business Basics</h2>
              <p className="text-muted-foreground">
                Tell us about your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="business-name">Business Name *</Label>
                <Input
                  id="business-name"
                  value={formData.businessName}
                  onChange={e => updateFormData('businessName', e.target.value)}
                  placeholder="Your business name"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={e => updateFormData('website', e.target.value)}
                  placeholder="https://yoursite.com"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={value => updateFormData('industry', value)}
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
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn Company Page</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinUrl}
                  onChange={e => updateFormData('linkedinUrl', e.target.value)}
                  placeholder="linkedin.com/company/yourcompany"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Problem & Goals</h2>
              <p className="text-muted-foreground">
                What problem do you solve and what do customers want to achieve?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="expensive-problem">
                  What expensive problem do you solve and what pain points does
                  it create? *
                </Label>
                <Textarea
                  id="expensive-problem"
                  value={formData.expensiveProblem}
                  onChange={e =>
                    updateFormData('expensiveProblem', e.target.value)
                  }
                  placeholder="Describe the costly problem your customers face..."
                  rows={4}
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="customer-goals">
                  What transformation or goals do your customers want to
                  achieve? *
                </Label>
                <Textarea
                  id="customer-goals"
                  value={formData.customerGoals}
                  onChange={e =>
                    updateFormData('customerGoals', e.target.value)
                  }
                  placeholder="Describe what success looks like for your customers..."
                  rows={4}
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Competition</h2>
              <p className="text-muted-foreground">
                What alternatives exist and who are your main competitors?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="current-alternatives">
                  What alternatives do customers currently use to solve this
                  problem? *
                </Label>
                <Textarea
                  id="current-alternatives"
                  value={formData.currentAlternatives}
                  onChange={e =>
                    updateFormData('currentAlternatives', e.target.value)
                  }
                  placeholder="List the current solutions, competitors, or workarounds customers use..."
                  rows={4}
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>

              <div>
                <Label>Your 3 Main Competitors (at least one required)</Label>
                <div className="space-y-4 mt-2">
                  {formData.competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <Input
                          value={competitor.name}
                          onChange={e =>
                            updateCompetitor(index, 'name', e.target.value)
                          }
                          placeholder={`Competitor ${index + 1} name`}
                          className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                        />
                      </div>
                      <div>
                        <Input
                          value={competitor.url}
                          onChange={e =>
                            updateCompetitor(index, 'url', e.target.value)
                          }
                          placeholder="Website URL (optional)"
                          className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Differentiation</h2>
              <p className="text-muted-foreground">
                What makes you different and why do customers choose you?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="unique-approach">
                  How do you solve this problem differently than others? *
                </Label>
                <Textarea
                  id="unique-approach"
                  value={formData.uniqueApproach}
                  onChange={e =>
                    updateFormData('uniqueApproach', e.target.value)
                  }
                  placeholder="Describe your unique methodology, approach, or solution..."
                  rows={4}
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="why-choose-you">
                  What's the primary reason customers choose you over
                  alternatives? *
                </Label>
                <Textarea
                  id="why-choose-you"
                  value={formData.whyChooseYou}
                  onChange={e => updateFormData('whyChooseYou', e.target.value)}
                  placeholder="What's your main competitive advantage or unique value proposition..."
                  rows={4}
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Identity & Success</h2>
              <p className="text-muted-foreground">
                Define your success metrics and core identity
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="success-metric">
                  What's your main success metric or goal? *
                </Label>
                <Textarea
                  id="success-metric"
                  value={formData.successMetric}
                  onChange={e =>
                    updateFormData('successMetric', e.target.value)
                  }
                  placeholder="How do you measure success? What outcomes matter most..."
                  rows={4}
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="core-identity">
                  Complete this statement: We're the [X] who [Y] *
                </Label>
                <Input
                  id="core-identity"
                  value={formData.coreIdentity}
                  onChange={e => updateFormData('coreIdentity', e.target.value)}
                  placeholder="e.g., We're the marketing consultants who help B2B SaaS companies scale faster"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Almost Done!
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                You're ready to get your quick start positioning. Click
                "Complete Setup" to generate your strategic foundation.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Quick Start Setup
            </h1>
            <p className="text-xl text-muted-foreground">
              Get your strategic foundation in 5 quick steps
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            Quick Start Setup - 5 Step Wizard
          </p>
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {steps.map(step => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                      step.id < currentStep
                        ? 'bg-green-600 text-white'
                        : step.id === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">{step.title}</span>
                  {step.id < totalSteps && (
                    <ChevronRight className="w-4 h-4 ml-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-8 custom-scrollbar">{renderStepContent()}</Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>

          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center gap-2"
          >
            {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
