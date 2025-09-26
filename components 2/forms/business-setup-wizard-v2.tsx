'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createBusiness, updateBusiness } from '@/app/actions/businesses';
import {
  Building2,
  Globe,
  Linkedin,
  Users,
  DollarSign,
  Calendar,
  Package,
  Target,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  Save
} from 'lucide-react';

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
  'Education', 'Real Estate', 'Professional Services', 'Food & Beverage',
  'Entertainment', 'Non-profit', 'Government', 'Other'
];

interface FormData {
  // Step 1 - Business Basics
  name: string;
  website_url: string;
  linkedin_url: string;
  industry: string;
  business_type: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | '';
  years_in_business: '<1' | '1-3' | '3-5' | '5-10' | '10+' | '';
  employee_count: '1-10' | '11-50' | '51-200' | '200-1000' | '1000+' | '';

  // Step 2 - Business Details
  business_model: 'Subscription' | 'One-time' | 'Retainer' | 'Commission' | '';
  avg_customer_ltv: '<$1K' | '$1-10K' | '$10-100K' | '$100K+' | 'Not sure' | '';
  primary_goal: 'Find product-market fit' | 'Scale what\'s working' | 'Enter new market' | 'Improve positioning' | 'Prepare for funding/exit' | '';
  description: string;
}

interface BusinessSetupWizardV2Props {
  userId: string;
  onComplete?: (business?: any) => void;
  existingBusiness?: any;
}

const STEPS = [
  { id: 1, title: 'Business Basics', description: 'Essential business information' },
  { id: 2, title: 'Business Details', description: 'Business model and goals' }
];

export function BusinessSetupWizardV2({ userId, onComplete, existingBusiness }: BusinessSetupWizardV2Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedBusinessId, setSavedBusinessId] = useState(existingBusiness?.id || null);

  const [formData, setFormData] = useState<FormData>({
    // Step 1 - Business Basics
    name: existingBusiness?.name || '',
    website_url: existingBusiness?.website_url || '',
    linkedin_url: existingBusiness?.linkedin_url || '',
    industry: existingBusiness?.industry || '',
    business_type: existingBusiness?.business_type || '',
    years_in_business: existingBusiness?.years_in_business || '',
    employee_count: existingBusiness?.employee_count || '',

    // Step 2 - Business Details
    business_model: existingBusiness?.business_model || '',
    avg_customer_ltv: existingBusiness?.avg_customer_ltv || '',
    primary_goal: existingBusiness?.primary_goal || '',
    description: existingBusiness?.description || ''
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep1 = () => {
    return formData.name &&
           formData.industry &&
           formData.business_type &&
           formData.years_in_business &&
           formData.employee_count;
  };

  const validateStep2 = () => {
    return formData.business_model &&
           formData.avg_customer_ltv &&
           formData.primary_goal;
  };

  const saveBasics = async () => {
    if (!validateStep1()) {
      toast.error('Please fill in all required fields');
      return false;
    }

    setIsLoading(true);
    try {
      const basicData = {
        name: formData.name,
        website_url: formData.website_url,
        linkedin_url: formData.linkedin_url,
        industry: formData.industry,
        business_type: formData.business_type,
        years_in_business: formData.years_in_business,
        employee_count: formData.employee_count,
        basics_completed_at: new Date().toISOString()
      };

      let result;
      if (savedBusinessId) {
        result = await updateBusiness(savedBusinessId, basicData);
      } else {
        result = await createBusiness(basicData);
      }

      if (result.success && result.data) {
        setSavedBusinessId(result.data.id);
        toast.success('Business basics saved! You can continue this later.');
        return true;
      } else {
        toast.error(result.error || 'Failed to save business');
        return false;
      }
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error('An error occurred while saving');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveComplete = async () => {
    if (!validateStep2()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const completeData = {
        business_model: formData.business_model,
        avg_customer_ltv: formData.avg_customer_ltv,
        primary_goal: formData.primary_goal,
        description: formData.description,
        onboarding_completed: true
      };

      const result = await updateBusiness(savedBusinessId, completeData);

      if (result.success) {
        toast.success('Business setup completed!');
        onComplete?.(result.data);
      } else {
        toast.error(result.error || 'Failed to complete setup');
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const saved = await saveBasics();
      if (saved) {
        setCurrentStep(2);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                step.id < currentStep ? "bg-primary text-primary-foreground" :
                step.id === currentStep ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              )}>
                {step.id < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2">
                <p className={cn(
                  "text-sm font-medium",
                  step.id === currentStep ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Business Basics</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Let's start with the essential information about your business.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Name */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Business Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Enter your business name"
            className="mt-1"
          />
        </div>

        {/* Website URL */}
        <div>
          <Label htmlFor="website" className="text-sm font-medium">Website URL</Label>
          <div className="mt-1 relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="website"
              value={formData.website_url}
              onChange={(e) => updateFormData({ website_url: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="pl-10"
            />
          </div>
        </div>

        {/* LinkedIn Company */}
        <div>
          <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn Company</Label>
          <div className="mt-1 relative">
            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="linkedin"
              value={formData.linkedin_url}
              onChange={(e) => updateFormData({ linkedin_url: e.target.value })}
              placeholder="linkedin.com/company/your-company"
              className="pl-10"
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <Label className="text-sm font-medium">Industry *</Label>
          <Select value={formData.industry} onValueChange={(value) => updateFormData({ industry: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your industry" />
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

        {/* Business Type */}
        <div>
          <Label className="text-sm font-medium">Business Type *</Label>
          <RadioGroup
            value={formData.business_type}
            onValueChange={(value) => updateFormData({ business_type: value as FormData['business_type'] })}
            className="mt-2"
          >
            <div className="flex flex-wrap gap-4">
              {['B2B', 'B2C', 'B2B2C', 'Marketplace'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Years in Business */}
        <div>
          <Label className="text-sm font-medium">Years in Business *</Label>
          <RadioGroup
            value={formData.years_in_business}
            onValueChange={(value) => updateFormData({ years_in_business: value as FormData['years_in_business'] })}
            className="mt-2"
          >
            <div className="flex flex-wrap gap-4">
              {['<1', '1-3', '3-5', '5-10', '10+'].map((years) => (
                <div key={years} className="flex items-center space-x-2">
                  <RadioGroupItem value={years} id={years} />
                  <Label htmlFor={years} className="text-sm">{years}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Employee Count */}
        <div>
          <Label className="text-sm font-medium">Employee Count *</Label>
          <RadioGroup
            value={formData.employee_count}
            onValueChange={(value) => updateFormData({ employee_count: value as FormData['employee_count'] })}
            className="mt-2"
          >
            <div className="flex flex-wrap gap-4">
              {['1-10', '11-50', '51-200', '200-1000', '1000+'].map((count) => (
                <div key={count} className="flex items-center space-x-2">
                  <RadioGroupItem value={count} id={count} />
                  <Label htmlFor={count} className="text-sm">{count}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Business Details</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Tell us about your business model and goals.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Model */}
        <div>
          <Label className="text-sm font-medium">Business Model *</Label>
          <RadioGroup
            value={formData.business_model}
            onValueChange={(value) => updateFormData({ business_model: value as FormData['business_model'] })}
            className="mt-2"
          >
            <div className="flex flex-wrap gap-4">
              {['Subscription', 'One-time', 'Retainer', 'Commission'].map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <RadioGroupItem value={model} id={model} />
                  <Label htmlFor={model} className="text-sm">{model}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Average Customer Lifetime Value */}
        <div>
          <Label className="text-sm font-medium">Avg Customer Lifetime Value *</Label>
          <RadioGroup
            value={formData.avg_customer_ltv}
            onValueChange={(value) => updateFormData({ avg_customer_ltv: value as FormData['avg_customer_ltv'] })}
            className="mt-2"
          >
            <div className="flex flex-wrap gap-4">
              {['<$1K', '$1-10K', '$10-100K', '$100K+', 'Not sure'].map((ltv) => (
                <div key={ltv} className="flex items-center space-x-2">
                  <RadioGroupItem value={ltv} id={ltv} />
                  <Label htmlFor={ltv} className="text-sm">{ltv}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Primary Goal */}
        <div>
          <Label className="text-sm font-medium">Primary Goal (Next 12 Months) *</Label>
          <RadioGroup
            value={formData.primary_goal}
            onValueChange={(value) => updateFormData({ primary_goal: value as FormData['primary_goal'] })}
            className="mt-2"
          >
            <div className="space-y-2">
              {[
                'Find product-market fit',
                'Scale what\'s working',
                'Enter new market',
                'Improve positioning',
                'Prepare for funding/exit'
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <RadioGroupItem value={goal} id={goal} />
                  <Label htmlFor={goal} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium">Business Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Tell us more about your business..."
            rows={4}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-3">
          {currentStep === 1 ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep1() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save & Continue
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={saveComplete}
              disabled={!validateStep2() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}