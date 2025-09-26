'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { createBusiness, updateBusiness } from '@/app/actions/businesses';
import { getOrganizations } from '@/app/actions/organizations';
import {
  Building2,
  Globe,
  Linkedin,
  Users,
  DollarSign,
  Calendar,
  Package,
  Target,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  Plus,
  X,
} from 'lucide-react';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Transportation',
  'Energy',
  'Media',
  'Telecommunications',
  'Agriculture',
  'Construction',
  'Hospitality',
  'Legal Services',
  'Consulting',
  'Marketing',
  'Non-Profit',
  'Government',
  'Other',
];

interface Service {
  name: string;
  url?: string;
}

interface Competitor {
  url: string;
  notes: string;
}

interface UploadedDocument {
  name: string;
  url: string;
  type: string;
}

interface FormData {
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
  documents: UploadedDocument[];
  annual_revenue: string;
}

interface BusinessSetupWizardProps {
  userId: string;
  onComplete?: (business?: any) => void;
  existingBusiness?: any;
}

export function BusinessSetupWizard({
  userId,
  onComplete,
  existingBusiness,
}: BusinessSetupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [basicsSaved, setBasicsSaved] = useState(false);
  const [businessId, setBusinessId] = useState<string | undefined>(
    existingBusiness?.id
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showOrgSelector, setShowOrgSelector] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: existingBusiness?.name || '',
    website_url: existingBusiness?.website_url || '',
    linkedin_url: existingBusiness?.linkedin_url || '',
    industry: existingBusiness?.industry || '',
    custom_industry: existingBusiness?.custom_industry || '',
    organization_id: existingBusiness?.organization_id || '',
    business_type: existingBusiness?.business_type || '',
    years_in_business: existingBusiness?.years_in_business || '',
    employee_count: existingBusiness?.employee_count || '',
    business_model: existingBusiness?.business_model || '',
    avg_customer_ltv: existingBusiness?.avg_customer_ltv || '',
    primary_goal: existingBusiness?.primary_goal || '',
    services:
      existingBusiness?.services?.length > 0
        ? existingBusiness.services
        : [{ name: '', url: '' }],
    competitors:
      existingBusiness?.competitors?.length > 0
        ? existingBusiness.competitors
        : [{ url: '', notes: '' }],
    documents:
      existingBusiness?.documents?.length > 0 ? existingBusiness.documents : [],
    annual_revenue: existingBusiness?.annual_revenue || '',
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

          // If user has multiple organizations, show selector
          if (result.data.length > 1) {
            setShowOrgSelector(true);
          }

          // If no organization is pre-selected and we have organizations, select the first one
          if (!existingBusiness?.organization_id && result.data.length > 0) {
            updateFormData({ organization_id: result.data[0].id });
          }
        }
      } catch (error) {
        console.error('Failed to load organizations:', error);
      }
    };

    loadOrganizations();
  }, []); // Run only once on mount

  const updateService = (
    index: number,
    field: 'name' | 'url',
    value: string
  ) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    updateFormData({ services: newServices });
  };

  const updateCompetitor = (
    index: number,
    field: 'url' | 'notes',
    value: string
  ) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = { ...newCompetitors[index], [field]: value };
    updateFormData({ competitors: newCompetitors });
  };

  const addService = () => {
    updateFormData({ services: [...formData.services, { name: '', url: '' }] });
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      const newServices = formData.services.filter((_, i) => i !== index);
      updateFormData({ services: newServices });
    }
  };

  const addCompetitor = () => {
    updateFormData({
      competitors: [...formData.competitors, { url: '', notes: '' }],
    });
  };

  const removeCompetitor = (index: number) => {
    if (formData.competitors.length > 1) {
      const newCompetitors = formData.competitors.filter((_, i) => i !== index);
      updateFormData({ competitors: newCompetitors });
    }
  };

  const addDocument = (file: File) => {
    // TODO: Upload file and get URL
    const newDoc: UploadedDocument = {
      name: file.name,
      url: 'placeholder-url',
      type: file.type,
    };
    updateFormData({ documents: [...formData.documents, newDoc] });
  };

  const removeDocument = (index: number) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    updateFormData({ documents: newDocuments });
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate Step 1 (Business Basics)
      if (!formData.name || !formData.industry) {
        toast.error('Missing Information', {
          description: 'Please fill in all required fields',
        });
        return;
      }

      // Save business basics after step 1
      await saveBusinessBasics();
    }

    if (currentStep === 3) {
      // Validate Step 3 (Services & Intelligence)
      const hasValidService = formData.services.some(
        service => service.name && service.name.trim()
      );
      if (!hasValidService) {
        toast.error('Missing Information', {
          description: 'Please add at least one service or product',
        });
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const saveBusinessBasics = async () => {
    setIsLoading(true);
    try {
      const basicsData = {
        name: formData.name,
        website_url: formData.website_url,
        linkedin_url: formData.linkedin_url,
        industry: formData.industry,
        ...(formData.custom_industry && {
          custom_industry: formData.custom_industry,
        }),
        user_id: userId,
        onboarding_completed: false,
        basics_completed_at: new Date().toISOString(),
        status_enum: 'onboarding' as const,
      };

      let result;
      if (businessId) {
        result = await updateBusiness(businessId, basicsData);
      } else {
        result = await createBusiness(basicsData);
        // Store the new business ID for subsequent updates
        if (result.data?.id) {
          setBusinessId(result.data.id);
        }
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setBasicsSaved(true);
      toast.success('Business basics saved!', {
        description: 'You can continue this setup later.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving business basics:', error);
      toast.error('Failed to save business basics', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setIsAnalyzing(true);

    try {
      // Clean up empty services and competitors
      const cleanedServices = formData.services.filter(s => s.name);
      const cleanedCompetitors = formData.competitors.filter(
        c => c.url || c.notes
      );

      // Extract documents and conditional enum fields from formData to avoid database errors
      const {
        documents,
        annual_revenue,
        business_type,
        years_in_business,
        employee_count,
        ...formDataWithoutDocuments
      } = formData;

      const businessData = {
        ...formDataWithoutDocuments,
        services: cleanedServices,
        competitors: cleanedCompetitors,
        user_id: userId,
        onboarding_completed: false,
        status_enum: 'onboarding' as const,
        // Only include enum fields if they have valid values
        ...(annual_revenue &&
          ['<$1M', '$1-10M', '$10-50M', '$50M+', 'Not disclosed'].includes(
            annual_revenue
          ) && { annual_revenue }),
        ...(business_type &&
          ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'Non-profit'].includes(
            business_type
          ) && { business_type }),
        ...(years_in_business &&
          ['<1', '1-3', '3-5', '5-10', '10+'].includes(years_in_business) && {
            years_in_business,
          }),
        ...(employee_count &&
          ['1-10', '11-50', '51-200', '200-1000', '1000+'].includes(
            employee_count
          ) && { employee_count }),
      };

      let result;
      if (businessId) {
        result = await updateBusiness(businessId, businessData);
      } else {
        result = await createBusiness(businessData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Business profile created successfully!', {
        description: 'AI analysis is running in the background.',
        duration: 5000,
      });

      // Move to confirmation step
      setCurrentStep(4);

      // Redirect after a delay
      setTimeout(() => {
        if (onComplete) {
          onComplete(result.data);
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error('Failed to save business profile', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    Array.from(files).forEach(file => {
      addDocument(file);
    });
    toast.success('Files Added', {
      description: `${files.length} file(s) added. Upload functionality coming soon!`,
    });
  };

  return (
    <div>
      {/* Step Progress Indicator */}
      <div className="mb-2 pb-4 border-b border-border">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                    step < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={cn(
                    'ml-2 text-sm font-medium',
                    step === currentStep
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {step === 1
                    ? 'Business Basics'
                    : step === 2
                      ? 'Business Details'
                      : step === 3
                        ? 'Services & Intelligence'
                        : 'Complete & Submit'}
                </span>
                {step < 4 && (
                  <ChevronRight className="w-4 h-4 ml-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-6">
        {/* Step 1: Business Basics */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                📊 BUSINESS BASICS
              </h3>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="name" className="block mb-2">
                    Business Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => updateFormData({ name: e.target.value })}
                    placeholder="Your Company Name"
                    required
                  />
                </div>

                {/* Organization Selector - only show if user has multiple organizations */}
                {showOrgSelector && (
                  <div className="space-y-4">
                    <Label htmlFor="organization" className="block mb-2">
                      <Building2 className="inline h-4 w-4 mr-1" />
                      Organization *
                    </Label>
                    <Select
                      value={formData.organization_id}
                      onValueChange={value =>
                        updateFormData({ organization_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization..." />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <Label htmlFor="website" className="block mb-2">
                    <Globe className="inline h-4 w-4 mr-1" />
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website_url}
                    onChange={e =>
                      updateFormData({ website_url: e.target.value })
                    }
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="linkedin" className="block mb-2">
                    <Linkedin className="inline h-4 w-4 mr-1" />
                    LinkedIn Company Page
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin_url}
                    onChange={e =>
                      updateFormData({ linkedin_url: e.target.value })
                    }
                    placeholder="linkedin.com/company/yourcompany"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="industry" className="block mb-2">
                    Industry *
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={value => updateFormData({ industry: value })}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.industry === 'Other' && (
                    <Input
                      placeholder="Please specify your industry"
                      value={formData.custom_industry || ''}
                      onChange={e =>
                        updateFormData({ custom_industry: e.target.value })
                      }
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                📈 BUSINESS DETAILS
              </h3>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="block mb-2">Business Type *</Label>
                  <RadioGroup
                    value={formData.business_type}
                    onValueChange={value =>
                      updateFormData({ business_type: value })
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {['B2B', 'B2C', 'B2B2C', 'Marketplace', 'Non-profit'].map(
                      type => (
                        <Label
                          key={type}
                          htmlFor={type}
                          className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <RadioGroupItem
                            value={type}
                            id={type}
                            className="border border-border"
                          />
                          <span className="font-normal">{type}</span>
                        </Label>
                      )
                    )}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="block mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Years in Business
                  </Label>
                  <RadioGroup
                    value={formData.years_in_business}
                    onValueChange={value =>
                      updateFormData({ years_in_business: value })
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {['<1', '1-3', '3-5', '5-10', '10+'].map(years => (
                      <Label
                        key={years}
                        htmlFor={`years-${years}`}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem
                          value={years}
                          id={`years-${years}`}
                          className="border border-border"
                        />
                        <span className="font-normal">
                          {years} {years === '<1' ? 'year' : 'years'}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="block mb-2 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Employee Count
                  </Label>
                  <RadioGroup
                    value={formData.employee_count}
                    onValueChange={value =>
                      updateFormData({ employee_count: value })
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {['1-10', '11-50', '51-200', '200-1000', '1000+'].map(
                      count => (
                        <Label
                          key={count}
                          htmlFor={`emp-${count}`}
                          className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <RadioGroupItem
                            value={count}
                            id={`emp-${count}`}
                            className="border border-border"
                          />
                          <span className="font-normal">{count}</span>
                        </Label>
                      )
                    )}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="block mb-2 flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Business Model
                  </Label>
                  <RadioGroup
                    value={formData.business_model}
                    onValueChange={value =>
                      updateFormData({ business_model: value })
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {['Subscription', 'One-time', 'Retainer', 'Commission'].map(
                      model => (
                        <Label
                          key={model}
                          htmlFor={`model-${model}`}
                          className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <RadioGroupItem
                            value={model}
                            id={`model-${model}`}
                            className="border border-border"
                          />
                          <span className="font-normal">{model}</span>
                        </Label>
                      )
                    )}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="block mb-2 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Average Customer LTV
                  </Label>
                  <RadioGroup
                    value={formData.avg_customer_ltv}
                    onValueChange={value =>
                      updateFormData({ avg_customer_ltv: value })
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {['<$1K', '$1-10K', '$10-100K', '$100K+', 'Not sure'].map(
                      ltv => (
                        <Label
                          key={ltv}
                          htmlFor={`ltv-${ltv}`}
                          className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <RadioGroupItem
                            value={ltv}
                            id={`ltv-${ltv}`}
                            className="border border-border"
                          />
                          <span className="font-normal">{ltv}</span>
                        </Label>
                      )
                    )}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="block mb-2 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Primary Goal
                  </Label>
                  <RadioGroup
                    value={formData.primary_goal}
                    onValueChange={value =>
                      updateFormData({ primary_goal: value })
                    }
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    {[
                      'Find product-market fit',
                      "Scale what's working",
                      'Enter new market',
                      'Improve positioning',
                      'Prepare for funding/exit',
                    ].map(goal => (
                      <Label
                        key={goal}
                        htmlFor={`goal-${goal.replace(/[^a-zA-Z0-9]/g, '-')}`}
                        className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors min-h-[60px] cursor-pointer"
                      >
                        <RadioGroupItem
                          value={goal}
                          id={`goal-${goal.replace(/[^a-zA-Z0-9]/g, '-')}`}
                          className="border border-border flex-shrink-0"
                        />
                        <span className="font-normal text-sm leading-tight">
                          {goal}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} className="flex items-center gap-2">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Services & Intelligence */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Services & Competitive Intelligence
              </h2>
              <p className="text-sm text-muted-foreground">
                Help us understand your offerings and market position
              </p>
            </div>
            {/* Services Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
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
                          onClick={() => removeService(index)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      id={`service-${index}`}
                      value={service.name}
                      onChange={e =>
                        updateService(index, 'name', e.target.value)
                      }
                      placeholder="e.g., Web Development, Consulting, SaaS Platform"
                    />
                    <Input
                      value={service.url || ''}
                      onChange={e =>
                        updateService(index, 'url', e.target.value)
                      }
                      placeholder="URL (optional)"
                      type="url"
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addService}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Service
                </Button>
              </div>
            </div>

            {/* Competitors Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
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
                          onClick={() => removeCompetitor(index)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Input
                        id={`competitor-${index}`}
                        value={competitor.url}
                        onChange={e =>
                          updateCompetitor(index, 'url', e.target.value)
                        }
                        placeholder="competitor.com"
                      />
                      <textarea
                        value={competitor.notes}
                        onChange={e =>
                          updateCompetitor(index, 'notes', e.target.value)
                        }
                        placeholder="What do they excel at? What do you like/dislike? How do they position themselves?"
                        className="w-full p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCompetitor}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Competitor
                </Button>
              </div>
            </div>

            {/* File Uploads Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText className="inline h-4 w-4 mr-1" />
                ADDITIONAL CONTEXT (Optional)
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload documents like pitch deck, one-pager, business summary,
                or any other relevant materials
              </p>

              <div className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                  onDrop={e => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files.length > 0) handleFileUpload(files);
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDragEnter={e => e.preventDefault()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">
                    Drag and drop files here
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">or</p>
                  <label htmlFor="documents-upload" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Choose Files</span>
                    </div>
                    <input
                      id="documents-upload"
                      type="file"
                      multiple
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports: PDF, PPT, DOC, TXT (Max 10MB each)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {formData.documents.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Uploaded Documents
                    </Label>
                    {formData.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {doc.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze & Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Setup Complete!
              </h2>
            </div>
            <div className="text-center py-8">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">
                    AI Analysis in Progress
                  </p>
                  <p className="text-muted-foreground">
                    Our AI is analyzing your business information to provide
                    personalized insights...
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium mb-2">
                    Your business profile is ready!
                  </p>
                  <p className="text-muted-foreground">
                    Redirecting you to your dashboard...
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
