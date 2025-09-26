'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Building2,
  Lightbulb,
  Target,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildFromScratchWizardProps {
  userId: string;
  onComplete: (result: any) => void;
  onClose: () => void;
}

interface FormData {
  businessName: string;
  website: string;
  startingPoint:
    | 'brand_new'
    | 'complete_rebrand'
    | 'need_research'
    | 'not_sure'
    | '';
}

const steps = [
  { id: 1, title: 'Business Info' },
  { id: 2, title: 'Starting Point' },
];

const startingPointOptions = [
  {
    value: 'brand_new',
    label: 'Brand New Business',
    description: 'Starting from scratch with a new business idea',
    icon: Building2,
    route: '/en/modules/1', // Foundation module
  },
  {
    value: 'complete_rebrand',
    label: 'Complete Rebrand',
    description: 'Existing business that needs a complete brand overhaul',
    icon: RefreshCw,
    route: '/en/modules/1', // Foundation module
  },
  {
    value: 'need_research',
    label: 'Need Market Research',
    description: 'I need to understand my market and competition first',
    icon: Target,
    route: '/en/modules/9', // Research module
  },
  {
    value: 'not_sure',
    label: 'Not Sure Where to Start',
    description: 'Help me figure out what I need',
    icon: Lightbulb,
    route: '/en/diagnostic', // Diagnostic tool
  },
];

export function BuildFromScratchWizard({
  userId,
  onComplete,
  onClose,
}: BuildFromScratchWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    website: '',
    startingPoint: '',
  });

  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the wizard
      onComplete({
        ...formData,
        selectedPath: 'build-from-scratch',
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName.trim() !== '';
      case 2:
        return formData.startingPoint !== '';
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
              <h2 className="text-2xl font-semibold">
                Basic Business Information
              </h2>
              <p className="text-muted-foreground">
                Tell us about your business project
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="business-name">
                  Business or Project Name *
                </Label>
                <Input
                  id="business-name"
                  value={formData.businessName}
                  onChange={e => updateFormData('businessName', e.target.value)}
                  placeholder="What do you call your business or project?"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Don't worry if this changes later - we just need something to
                  call it for now
                </p>
              </div>

              <div>
                <Label htmlFor="website">Website (if you have one)</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={e => updateFormData('website', e.target.value)}
                  placeholder="https://yoursite.com (optional)"
                  className="!bg-yellow-50/50 dark:!bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 focus-visible:!bg-blue-50/70 dark:focus-visible:!bg-blue-900/30 focus-visible:ring-blue-500 focus-visible:border-blue-400"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave blank if you don't have a website yet
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                Choose Your Starting Point
              </h2>
              <p className="text-muted-foreground">
                Where are you in your business journey? This will determine
                which modules you start with.
              </p>
            </div>

            <RadioGroup
              value={formData.startingPoint}
              onValueChange={(value: any) =>
                updateFormData('startingPoint', value)
              }
            >
              <div className="grid grid-cols-1 gap-4">
                {startingPointOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      htmlFor={option.value}
                      className={cn(
                        'flex items-start space-x-4 p-6 rounded-lg border cursor-pointer transition-all hover:bg-accent/50',
                        formData.startingPoint === option.value &&
                          'border-primary bg-primary/5 hover:bg-primary/10'
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="mt-1"
                      />
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-lg flex items-center justify-center',
                              formData.startingPoint === option.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="font-semibold text-lg">
                            {option.label}
                          </div>
                          <div className="text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            {formData.startingPoint && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Perfect! Here's what happens next:
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      {formData.startingPoint === 'brand_new' &&
                        "You'll start with Module 1: Foundation to build your brand from the ground up."}
                      {formData.startingPoint === 'complete_rebrand' &&
                        "You'll start with Module 1: Foundation to rebuild your brand strategy."}
                      {formData.startingPoint === 'need_research' &&
                        "You'll start with Module 9: Research to understand your market and competition."}
                      {formData.startingPoint === 'not_sure' &&
                        "You'll go to our Diagnostic Tool to figure out the best path for your specific situation."}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
              Build From Scratch
            </h1>
            <p className="text-xl text-muted-foreground">
              Let's figure out where to start your brand journey
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            Build From Scratch - 2 Step Setup
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
            {currentStep === totalSteps ? 'Start My Journey' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
