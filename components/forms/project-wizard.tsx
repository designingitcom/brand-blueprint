'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Plus,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Wand2,
  Settings,
  Layers,
  GripVertical,
  AlertCircle,
  Link2,
  Zap,
  Shield,
  Rocket,
  Star,
  X,
  Briefcase
} from 'lucide-react';
import {
  createProject,
  updateProject,
  type CreateProjectData,
  type UpdateProjectData,
} from '@/app/actions/projects';
import { getBusinesses } from '@/app/actions/businesses';
import { getBusinessStatus } from '@/lib/utils/business-status';

// Project schema for validation
const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string().optional(),
  business_id: z.string().min(1, 'Business is required').refine(val => val !== 'no-business', 'Please select a valid business'),
  code: z.string().optional(),
  strategy_mode: z.enum(['custom', 'predefined']).default('custom'),
  strategy_path_id: z.string().optional(),
  base_project_id: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'review', 'completed', 'on_hold']).default('pending'),
  description: z.string().optional(),
  selected_modules: z.array(z.string()).default([]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectWizardProps {
  project?: {
    id?: string;
    name?: string;
    slug?: string;
    business_id?: string;
    code?: string;
    strategy_mode?: 'custom' | 'predefined';
    strategy_path_id?: string;
    base_project_id?: string;
    status?: 'pending' | 'in_progress' | 'review' | 'completed' | 'on_hold';
    description?: string;
  };
  businessId?: string;
  businesses?: Array<{ id: string; name: string; slug?: string }>;
  onSuccess?: (project: any) => void;
  onCancel?: () => void;
  trigger?: React.ReactNode | null;
}

// Module interface with prerequisites
interface Module {
  id: string;
  name: string;
  category: string;
  description: string;
  questions: number;
  prerequisites?: string[]; // IDs of prerequisite modules
}

// Mock data for demo - will be replaced with real data
const MOCK_STRATEGY_PATHS = [
  {
    id: 'strategy-1',
    name: 'Brand Identity Complete',
    description: 'Full brand identity development including logo, colors, typography, and guidelines',
    target_audience: 'New businesses needing complete brand identity',
    module_count: 8
  },
  {
    id: 'strategy-2', 
    name: 'Digital Marketing Launch',
    description: 'Complete digital marketing setup including website, social media, and advertising',
    target_audience: 'Businesses launching digital presence',
    module_count: 12
  },
  {
    id: 'strategy-3',
    name: 'Product Launch Strategy',
    description: 'End-to-end product launch including market research, positioning, and go-to-market',
    target_audience: 'Companies launching new products',
    module_count: 15
  }
];

const MOCK_MODULES: Module[] = [
  // Brand Strategy
  { id: 'mod-1', name: 'Brand Positioning', category: 'Brand Strategy', description: 'Define unique brand position in market', questions: 12 },
  { id: 'mod-2', name: 'Target Audience Research', category: 'Brand Strategy', description: 'Identify and research target customers', questions: 8, prerequisites: ['mod-1'] },
  { id: 'mod-3', name: 'Competitive Analysis', category: 'Brand Strategy', description: 'Analyze competitive landscape', questions: 10, prerequisites: ['mod-1'] },
  
  // Visual Identity  
  { id: 'mod-4', name: 'Logo Design', category: 'Visual Identity', description: 'Create brand logo and variations', questions: 15, prerequisites: ['mod-1'] },
  { id: 'mod-5', name: 'Color Palette', category: 'Visual Identity', description: 'Develop brand color system', questions: 6, prerequisites: ['mod-4'] },
  { id: 'mod-6', name: 'Typography Selection', category: 'Visual Identity', description: 'Choose brand fonts and typography', questions: 5, prerequisites: ['mod-4'] },
  
  // Digital Marketing
  { id: 'mod-7', name: 'Website Strategy', category: 'Digital Marketing', description: 'Plan website structure and content', questions: 14, prerequisites: ['mod-2', 'mod-4'] },
  { id: 'mod-8', name: 'Social Media Strategy', category: 'Digital Marketing', description: 'Develop social media presence', questions: 11, prerequisites: ['mod-2', 'mod-5'] },
  { id: 'mod-9', name: 'Content Calendar', category: 'Digital Marketing', description: 'Plan content across channels', questions: 8, prerequisites: ['mod-8'] },
  
  // Implementation
  { id: 'mod-10', name: 'Brand Guidelines', category: 'Implementation', description: 'Create comprehensive brand guide', questions: 20, prerequisites: ['mod-4', 'mod-5', 'mod-6'] },
  { id: 'mod-11', name: 'Asset Creation', category: 'Implementation', description: 'Develop brand assets and templates', questions: 18, prerequisites: ['mod-10'] },
  { id: 'mod-12', name: 'Launch Plan', category: 'Implementation', description: 'Plan brand launch execution', questions: 9, prerequisites: ['mod-11'] },
];

// Strategy templates for prebuild approach
interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  moduleIds: string[];
  color: string;
}

const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'startup-launch',
    name: 'Startup Launch',
    description: 'Essential branding for new startups and businesses',
    icon: Rocket,
    moduleIds: ['mod-1', 'mod-2', 'mod-4', 'mod-5', 'mod-7'],
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  {
    id: 'complete-rebrand', 
    name: 'Complete Rebrand',
    description: 'Full brand overhaul for established companies',
    icon: Star,
    moduleIds: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-10', 'mod-11'],
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  },
  {
    id: 'digital-first',
    name: 'Digital-First Brand',
    description: 'Modern approach focused on digital presence',
    icon: Zap,
    moduleIds: ['mod-1', 'mod-4', 'mod-7', 'mod-8', 'mod-9'],
    color: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  {
    id: 'premium-brand',
    name: 'Premium Brand',
    description: 'Sophisticated branding for luxury and premium markets',
    icon: Shield,
    moduleIds: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-10'],
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  }
];


const WIZARD_STEPS = [
  { id: 1, title: 'Select Business', description: 'Choose which business this project belongs to' },
  { id: 2, title: 'Project Details', description: 'Basic project information' },
  { id: 3, title: 'Modules & Strategy', description: 'Select approach and modules' },
  { id: 4, title: 'Review', description: 'Confirm and create' }
];

export function ProjectWizard({
  project,
  businessId,
  businesses: providedBusinesses,
  onSuccess,
  onCancel,
  trigger,
}: ProjectWizardProps) {
  const [open, setOpen] = useState(!trigger);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const [businesses, setBusinesses] = useState(providedBusinesses || []);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropZoneIndex, setDropZoneIndex] = useState<number | null>(null);
  const [strategyTab, setStrategyTab] = useState<'prebuild' | 'custom'>('prebuild');
  const isEditing = !!project?.id;

  // Load businesses if not provided
  useEffect(() => {
    async function loadBusinesses() {
      // Only load if no businesses were provided
      if (!providedBusinesses || providedBusinesses.length === 0) {
        setLoadingBusinesses(true);
        try {
          const result = await getBusinesses();
          if (result.success) {
            // Filter to only show businesses that are active (have completed onboarding)
            const activeBusinesses = (result.data || []).filter(business => {
              const statusInfo = getBusinessStatus(business);
              return statusInfo.status === 'active';
            });
            setBusinesses(activeBusinesses);
            // Clear business-related errors when businesses load successfully
            if (error && error.toLowerCase().includes('business')) {
              setError('');
            }
          } else {
            console.error('Failed to load businesses:', result.error);
          }
        } catch (error) {
          console.error('Error loading businesses:', error);
        } finally {
          setLoadingBusinesses(false);
        }
      }
    }
    loadBusinesses();
  }, [providedBusinesses]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      slug: project?.slug || '',
      business_id: project?.business_id || businessId || '',
      code: project?.code || '',
      strategy_mode: project?.strategy_mode || 'custom',
      strategy_path_id: project?.strategy_path_id || '',
      base_project_id: project?.base_project_id || '',
      status: project?.status || 'pending',
      description: project?.description || '',
      selected_modules: [],
    },
  });

  const watchedStrategyMode = form.watch('strategy_mode');
  const watchedStrategyPath = form.watch('strategy_path_id');
  const selectedModules = form.watch('selected_modules');

  // Clear errors when business selection changes to valid business or businesses become available
  useEffect(() => {
    const businessId = form.watch('business_id');
    
    // Clear business-related errors when valid business is selected
    if (businessId && businessId !== 'no-business' && businesses.length > 0) {
      const validBusiness = businesses.find(b => b.id === businessId);
      if (validBusiness && error && error.toLowerCase().includes('business')) {
        setError('');
      }
    }
    
    // Clear "no businesses available" errors when businesses are loaded
    if (businesses.length > 0 && error.includes('Create one first')) {
      setError('');
    }
  }, [form.watch('business_id'), businesses, error]);

  // Auto-generate slug and project code from name
  const handleNameChange = (value: string) => {
    if (!hasManuallyEditedSlug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', generatedSlug);
    }
    
    // Auto-generate project code
    if (value) {
      const businessName = businesses.find(b => b.id === form.watch('business_id'))?.name || 'PROJ';
      const businessCode = businessName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);
      
      const projectCode = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);
      
      const timestamp = Date.now().toString().slice(-4);
      const generatedCode = `${businessCode}-${projectCode}-${timestamp}`;
      form.setValue('code', generatedCode);
    }
  };

  // Load modules from strategy path
  const loadStrategyModules = (strategyPathId: string) => {
    const strategyPath = MOCK_STRATEGY_PATHS.find(sp => sp.id === strategyPathId);
    if (strategyPath) {
      // For demo, load first N modules based on strategy
      const moduleIds = MOCK_MODULES.slice(0, strategyPath.module_count).map(m => m.id);
      form.setValue('selected_modules', moduleIds);
    }
  };

  // Load modules from strategy template
  const loadStrategyTemplate = (templateId: string) => {
    const template = STRATEGY_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      form.setValue('selected_modules', template.moduleIds);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError('');
    
    console.log('ProjectWizard onSubmit called with data:', data);
    
    // Enhanced business validation with better error messages
    if (!data.business_id || data.business_id === 'no-business') {
      if (businesses.length === 0) {
        setError('No businesses available. Please create a business first before creating a project.');
      } else {
        setError('Please select a business for this project.');
      }
      setIsSubmitting(false);
      return;
    }
    
    // Validate business exists in available businesses with better error handling
    const selectedBusiness = businesses.find(b => b.id === data.business_id);
    if (!selectedBusiness) {
      console.error('Selected business not found in available businesses:', {
        selectedId: data.business_id,
        availableBusinesses: businesses.map(b => ({ id: b.id, name: b.name }))
      });
      
      // More specific error based on context
      if (businesses.length === 0) {
        setError('Business data is still loading. Please wait and try again.');
      } else {
        setError('The selected business is no longer available. Please refresh the page and select a different business.');
      }
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      
      if (isEditing && project?.id) {
        const updateData: UpdateProjectData = {
          name: data.name,
          slug: data.slug || undefined,
          code: data.code || undefined,
          strategy_mode: data.strategy_mode,
          strategy_path_id: data.strategy_path_id || undefined,
          base_project_id: data.base_project_id || undefined,
          status: data.status,
        };
        
        result = await updateProject(project.id, updateData);
      } else {
        const submitData: CreateProjectData = {
          name: data.name,
          slug: data.slug || undefined,
          business_id: data.business_id,
          code: data.code || undefined,
          strategy_mode: data.strategy_mode,
          strategy_path_id: data.strategy_path_id || undefined,
          base_project_id: data.base_project_id || undefined,
          status: 'pending',
        };

        console.log('Project creation data:', submitData);
        console.log('Available businesses:', businesses.map(b => ({ id: b.id, name: b.name })));
        
        result = await createProject(submitData);
      }

      if (result.error) {
        console.error('Project creation failed:', result.error);
        
        // Provide more helpful error messages based on error type
        if (result.error.includes('Business not found')) {
          setError('The selected business is no longer available. Please refresh the page and select a different business.');
        } else if (result.error.includes('organization')) {
          setError('Organization access issue. Please verify your permissions and try again.');
        } else if (result.error.includes('tenant')) {
          setError('Account configuration issue. Please contact support.');
        } else {
          setError(result.error);
        }
        return;
      }

      // Success! Clear any lingering errors and reset form
      setError('');
      setOpen(false);
      form.reset();
      setCurrentStep(1);
      setHasManuallyEditedSlug(false);
      
      if (isEditing) {
        window.location.reload();
      }
      
      onSuccess?.(result.data);
    } catch (err) {
      console.error('Project creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Provide recovery suggestions based on error type
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network connection issue. Please check your internet connection and try again.');
      } else {
        setError(`${errorMessage}. Please try again or refresh the page.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setError(''); // Clear any existing errors when moving to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setError(''); // Clear any existing errors when moving to previous step
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        // Business selection step
        return form.watch('business_id') && businesses.length > 0;
      case 2:
        // Project details step
        return form.watch('name') && form.watch('business_id');
      case 3:
        // Module selection is optional
        return true;
      default:
        return true;
    }
  };

  const toggleModule = (moduleId: string) => {
    const current = form.getValues('selected_modules');
    const module = MOCK_MODULES.find(m => m.id === moduleId);
    
    if (current.includes(moduleId)) {
      // Removing module - check if any selected modules depend on it
      const dependentModules = MOCK_MODULES.filter(
        m => current.includes(m.id) && m.prerequisites?.includes(moduleId)
      );
      if (dependentModules.length > 0) {
        alert(`Cannot remove this module. The following modules depend on it: ${dependentModules.map(m => m.name).join(', ')}`);
        return;
      }
      form.setValue('selected_modules', current.filter(id => id !== moduleId));
    } else {
      // Adding module - automatically add prerequisites
      const missingPrereqs = module?.prerequisites?.filter(p => !current.includes(p)) || [];
      const prereqModules = MOCK_MODULES.filter(m => missingPrereqs.includes(m.id));
      
      if (prereqModules.length > 0) {
        const newModules = [...current, ...missingPrereqs, moduleId];
        form.setValue('selected_modules', [...new Set(newModules)]);
      } else {
        form.setValue('selected_modules', [...current, moduleId]);
      }
    }
  };

  const reorderModules = (startIndex: number, endIndex: number) => {
    const current = form.getValues('selected_modules');
    const result = Array.from(current);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    form.setValue('selected_modules', result);
  };

  const getPrerequisiteStatus = (moduleId: string) => {
    const module = MOCK_MODULES.find(m => m.id === moduleId);
    if (!module?.prerequisites || module.prerequisites.length === 0) {
      return { hasPrereqs: false, satisfied: true, missing: [] };
    }
    
    const current = form.getValues('selected_modules');
    const missing = module.prerequisites.filter(p => !current.includes(p));
    
    return {
      hasPrereqs: true,
      satisfied: missing.length === 0,
      missing: missing.map(id => MOCK_MODULES.find(m => m.id === id)?.name || id)
    };
  };

  const getModulesByCategory = () => {
    const categories: Record<string, typeof MOCK_MODULES> = {};
    MOCK_MODULES.forEach(module => {
      if (!categories[module.category]) {
        categories[module.category] = [];
      }
      categories[module.category].push(module);
    });
    return categories;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Business Selection Step
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Select Business for Project</h3>
              <p className="text-sm text-muted-foreground">
                Choose which business this project belongs to. Only active businesses are available for projects.
              </p>
            </div>

            {loadingBusinesses ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading businesses...</p>
                </div>
              </div>
            ) : businesses.length === 0 ? (
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="font-medium text-amber-900">No Active Businesses</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      You need at least one active business (that has completed onboarding) to create a project.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={() => onCancel?.()}>
                      Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={() => window.location.href = '/businesses'}>
                      Manage Businesses
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <FormField
                control={form.control}
                name="business_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Business *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!businessId}
                    >
                      <FormControl>
                        <SelectTrigger className="h-auto">
                          <SelectValue placeholder="Choose a business for this project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businesses.map(business => (
                          <SelectItem key={business.id} value={business.id} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Briefcase className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium">{business.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {(() => {
                                    const statusInfo = getBusinessStatus(business);
                                    return `${statusInfo.label} • ${statusInfo.description}`;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This project will be associated with the selected business and follow its brand guidelines.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      case 2:
        // Project Details Step
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name"
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Auto-generated from project name" {...field} readOnly />
                    </FormControl>
                    <FormDescription>
                      Auto-generated internal project identifier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="project-slug"
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          setHasManuallyEditedSlug(true);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this project..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of the project scope and goals.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        const modulesByCategory = getModulesByCategory();
        const selectedModuleDetails = selectedModules
          .map(id => MOCK_MODULES.find(m => m.id === id))
          .filter(Boolean) as Module[];
        
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Select Strategy & Modules</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a strategy approach and select modules for your project
                </p>
              </div>
              <Badge variant="secondary">
                {selectedModules.length} modules • {selectedModuleDetails.reduce((sum, m) => sum + m.questions, 0)} questions
              </Badge>
            </div>

            {/* Two Column Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 mb-4">
              {/* Left Column - Strategy Selection */}
              <div className="flex flex-col min-h-0">
                {/* Tab Buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setStrategyTab('prebuild')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      strategyTab === 'prebuild'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <Wand2 className="h-4 w-4 inline-block mr-1" />
                    Prebuild Strategy
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrategyTab('custom')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      strategyTab === 'custom'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <Settings className="h-4 w-4 inline-block mr-1" />
                    Custom Modules
                  </button>
                </div>
                <div 
                  className="border rounded-lg p-3 space-y-4 custom-scrollbar" 
                  style={{
                    height: '300px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}
                >
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: hsl(var(--muted-foreground)) transparent;
                      }
                      .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: hsl(var(--border));
                        border-radius: 3px;
                        transition: background 0.2s ease;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: hsl(var(--muted-foreground));
                      }
                      .custom-scrollbar:hover {
                        scrollbar-color: hsl(var(--muted-foreground)) hsl(var(--muted));
                      }
                    `
                  }} />
                  {strategyTab === 'prebuild' ? (
                    // Strategy Templates
                    <div className="space-y-3">
                      <h5 className="font-medium text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <Wand2 className="h-3 w-3" />
                        Pre-built Strategies
                      </h5>
                      {STRATEGY_TEMPLATES.map(template => {
                        const Icon = template.icon;
                        return (
                          <div
                            key={template.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${template.color}`}
                            onClick={() => loadStrategyTemplate(template.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h6 className="font-semibold text-sm">{template.name}</h6>
                                  <Badge variant="secondary" className="text-xs">
                                    {template.moduleIds.length} modules
                                  </Badge>
                                </div>
                                <p className="text-xs opacity-80 mb-2">
                                  {template.description}
                                </p>
                                <div className="text-xs opacity-60">
                                  Includes: {template.moduleIds.map(id => 
                                    MOCK_MODULES.find(m => m.id === id)?.name
                                  ).join(', ')}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Custom Modules
                    Object.entries(modulesByCategory).map(([category, modules]) => (
                      <div key={category}>
                        <h5 className="font-medium text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {category}
                        </h5>
                        <div className="space-y-2">
                          {modules.map(module => {
                            const prereqStatus = getPrerequisiteStatus(module.id);
                            const isSelected = selectedModules.includes(module.id);
                            
                            return (
                              <div
                                key={module.id}
                                className={`p-3 rounded-md border cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-card hover:bg-accent/50'
                                } ${!prereqStatus.satisfied ? 'opacity-60' : ''}`}
                                onClick={() => toggleModule(module.id)}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5">
                                    {isSelected ? (
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h6 className="font-medium text-sm truncate">{module.name}</h6>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {prereqStatus.hasPrereqs && (
                                          <div className="group relative">
                                            <Link2 className={`h-3 w-3 ${
                                              prereqStatus.satisfied ? 'text-green-500' : 'text-amber-500'
                                            }`} />
                                            <div className="absolute right-0 top-5 z-50 hidden group-hover:block">
                                              <div className="bg-popover text-popover-foreground p-2 rounded-md shadow-lg border text-xs whitespace-nowrap">
                                                {prereqStatus.satisfied 
                                                  ? 'Prerequisites met' 
                                                  : `Requires: ${prereqStatus.missing.join(', ')}`}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                          {module.questions}q
                                        </Badge>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {module.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column - Selected Modules */}
              <div className="flex flex-col min-h-0">
                <div className="h-[42px] flex items-end mb-3">
                  <h4 className="font-medium text-sm">Selected Modules (drag to reorder)</h4>
                </div>
                <div 
                  className="border rounded-lg p-3 custom-scrollbar" 
                  style={{
                    height: '300px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}
                >
                  {selectedModules.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No modules selected</p>
                        <p className="text-xs mt-1">Click modules on the left to add them</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {selectedModules.map((moduleId, index) => {
                        const module = MOCK_MODULES.find(m => m.id === moduleId);
                        if (!module) return null;
                        
                        const isDragging = draggedIndex === index;
                        const isDropZone = dropZoneIndex === index;
                        
                        return (
                          <div key={moduleId} className="relative">
                            {/* Drop zone indicator */}
                            {isDropZone && draggedIndex !== index && (
                              <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full animate-pulse z-10" />
                            )}
                            
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('dragIndex', index.toString());
                                setDraggedIndex(index);
                              }}
                              onDragEnd={() => {
                                setDraggedIndex(null);
                                setDropZoneIndex(null);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                setDropZoneIndex(index);
                              }}
                              onDragLeave={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                  setDropZoneIndex(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
                                if (dragIndex !== index) {
                                  reorderModules(dragIndex, index);
                                }
                                setDraggedIndex(null);
                                setDropZoneIndex(null);
                              }}
                              className={`flex items-center gap-2 p-3 rounded-md border bg-card cursor-move transition-all duration-200 ${
                                isDragging 
                                  ? 'opacity-50 scale-95 rotate-2 shadow-lg bg-primary/5 border-primary/50' 
                                  : 'hover:bg-accent/50 hover:shadow-sm'
                              } ${isDropZone && !isDragging ? 'bg-primary/5 border-primary/30' : ''}`}
                            >
                              <GripVertical className={`h-4 w-4 flex-shrink-0 transition-colors ${
                                isDragging ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                              <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate transition-colors ${
                                  isDragging ? 'text-primary' : ''
                                }`}>
                                  {module.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{module.category}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {module.questions}q
                              </Badge>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModule(module.id);
                                }}
                                className="ml-2 p-1 hover:bg-destructive/10 hover:text-destructive rounded-sm transition-colors flex-shrink-0 cursor-pointer"
                                title="Remove module"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        const businessId = form.watch('business_id');
        const selectedBusiness = businesses.find(b => b.id === businessId);
        const selectedStrategy = MOCK_STRATEGY_PATHS.find(sp => sp.id === watchedStrategyPath);
        
        // Debug logging
        if (!selectedBusiness && businessId) {
          console.log('Business not found:', { businessId, availableBusinesses: businesses });
        }
        // Keep modules in the selected order
        const orderedModuleDetails = selectedModules
          .map(id => MOCK_MODULES.find(m => m.id === id))
          .filter(Boolean) as Module[];
        
        // Show loading if businesses are still loading
        if (loadingBusinesses) {
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Review & Create Project</h3>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading project details...</span>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review & Create Project</h3>
            
            <div className="space-y-4">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-sm">{form.watch('name')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Business:</span>
                    <span className="text-sm">
                      {selectedBusiness ? (
                        <span className="text-green-700 font-medium">{selectedBusiness.name}</span>
                      ) : (
                        <span className="text-red-600">Not selected</span>
                      )}
                    </span>
                  </div>
                  {form.watch('code') && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Code:</span>
                      <span className="text-sm">{form.watch('code')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Approach:</span>
                    <span className="text-sm capitalize">{watchedStrategyMode}</span>
                  </div>
                  {selectedStrategy && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Template:</span>
                        <span className="text-sm">{selectedStrategy.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Modules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selected Modules ({selectedModules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderedModuleDetails.length > 0 ? (
                    <div className="space-y-2">
                      {orderedModuleDetails.map((module, index) => (
                        <div key={module.id} className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                          <Badge variant="outline" className="flex-1 justify-start">
                            {module.name} ({module.questions} questions)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No modules selected</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        console.log('Dialog open state changing to:', newOpen);
        setOpen(newOpen);
        if (!newOpen) {
          setCurrentStep(1);
          setHasManuallyEditedSlug(false);
          setError('');
          onCancel?.();
        }
      }}
    >
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[900px] w-[95vw] h-[85vh] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update project information and settings.'
              : 'Follow the steps to create your project with the right strategy and modules.'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep === step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : currentStep > step.id 
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden lg:block">{step.description}</div>
                  </div>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-border mx-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mx-6 mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
              <div className="h-full">
                {renderStepContent()}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    onCancel?.();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                
                {currentStep < WIZARD_STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToNext()}
                    className="gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Project
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}