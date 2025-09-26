# Business Onboarding UI/UX Specifications

## Design System Standards

This document defines the comprehensive UI/UX patterns, component specifications, and design standards for the business onboarding system, adhering to the existing CLAUDE.md guidelines.

## Core Design Principles

### 1. Progressive Disclosure

- Show only relevant information at each step
- Use collapsible sections for advanced options
- Provide clear visual hierarchy

### 2. Confidence Building

- Show progress indicators throughout
- Provide clear success states
- Use AI confidence scores to build trust

### 3. Graceful Guidance

- Offer contextual help and suggestions
- Provide clear error messages with solutions
- Enable both guided and self-directed paths

### 4. Consistent Interaction Patterns

- Maintain consistent navigation patterns
- Use familiar form interaction models
- Provide predictable feedback

## Layout Architecture

### Main Layout Structure

```tsx
<div className="min-h-screen bg-background">
  <OnboardingHeader />
  <div className="flex">
    <ProgressSidebar className="w-80" />
    <MainContent className="flex-1">
      <StepContainer />
    </MainContent>
    <AIAssistantPanel className="w-96" />
  </div>
</div>
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
.onboarding-layout {
  /* Mobile: < 768px */
  @media (max-width: 767px) {
    --sidebar-width: 0;
    --ai-panel-width: 0;
    --content-padding: 1rem;
  }

  /* Tablet: 768px - 1023px */
  @media (min-width: 768px) and (max-width: 1023px) {
    --sidebar-width: 280px;
    --ai-panel-width: 0;
    --content-padding: 2rem;
  }

  /* Desktop: >= 1024px */
  @media (min-width: 1024px) {
    --sidebar-width: 320px;
    --ai-panel-width: 384px;
    --content-padding: 3rem;
  }
}
```

## Step Progress Indicator Standards

### Phase-Step Visual Pattern

Following CLAUDE.md specifications for step indicators:

```tsx
<div className="mb-4">
  <p className="text-sm text-muted-foreground mb-3">
    Business Onboarding - 4 Phase Wizard
  </p>
  <div className="flex items-center">
    <div className="flex items-center space-x-3">
      {phases.map(phase => (
        <div key={phase.id} className="flex items-center">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              phase.id < currentPhase
                ? 'bg-primary text-primary-foreground'
                : phase.id === currentPhase
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {phase.id < currentPhase ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              phase.id
            )}
          </div>
          <span
            className={cn(
              'ml-2 text-sm font-medium',
              phase.id === currentPhase
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            {phase.title}
          </span>
          {phase.id < totalPhases && (
            <ChevronRight className="w-4 h-4 ml-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  </div>
</div>
```

### Step Progress Variations

#### 1. Compact Progress (Mobile)

```tsx
<div className="flex items-center justify-between mb-4">
  <span className="text-sm text-muted-foreground">
    Step {currentStep} of {totalSteps}
  </span>
  <div className="flex items-center gap-1">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'w-2 h-2 rounded-full',
          i < currentStep
            ? 'bg-primary'
            : i === currentStep
              ? 'bg-primary'
              : 'bg-muted'
        )}
      />
    ))}
  </div>
</div>
```

#### 2. Detailed Progress (Desktop)

```tsx
<div className="space-y-4">
  {phases.map(phase => (
    <div key={phase.id} className="space-y-2">
      <div className="flex items-center gap-3">
        <PhaseIndicator phase={phase} current={currentPhase} />
        <span className="font-medium">{phase.title}</span>
      </div>
      <div className="ml-11 space-y-1">
        {phase.steps.map(step => (
          <StepIndicator
            key={step.id}
            step={step}
            current={currentStep}
            completed={completedSteps.includes(step.id)}
          />
        ))}
      </div>
    </div>
  ))}
</div>
```

## Dialog and Modal Patterns

### Standard Dialog Structure

Following CLAUDE.md dialog specifications:

```tsx
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0">
  <DialogHeader className="px-6 pt-6 pb-4">
    <DialogTitle className="sr-only">Business Onboarding</DialogTitle>
  </DialogHeader>
  <div className="px-6 pb-6">
    <StepProgressIndicator />
    <StepContent />
    <NavigationFooter />
  </div>
</DialogContent>
```

### AI Suggestion Modal

```tsx
<Dialog>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar p-0">
    <DialogHeader className="px-6 pt-6 pb-2">
      <DialogTitle>AI Suggestions</DialogTitle>
    </DialogHeader>
    <div className="px-6 pb-6">
      <SuggestionsList />
      <ConfidenceIndicator />
      <ActionButtons />
    </div>
  </DialogContent>
</Dialog>
```

## Form Component Specifications

### Input Field Standards

#### Text Input

```tsx
<div className="space-y-2">
  <Label htmlFor="businessName" className="text-sm font-medium">
    Business Name *
  </Label>
  <Input
    id="businessName"
    value={value}
    onChange={onChange}
    placeholder="Enter your business name"
    className={cn(
      'transition-colors',
      error && 'border-destructive focus:border-destructive'
    )}
  />
  {error && <p className="text-sm text-destructive">{error}</p>}
  {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
</div>
```

#### Radio Group (Per CLAUDE.md standards)

```tsx
<div className="space-y-4">
  <Label className="text-sm font-medium">Business Type *</Label>
  <RadioGroup value={value} onValueChange={onChange}>
    {options.map(option => (
      <div
        key={option.value}
        className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <RadioGroupItem
          value={option.value}
          id={option.value}
          className="border border-border"
        />
        <Label
          htmlFor={option.value}
          className="cursor-pointer font-normal flex-1"
        >
          <div className="font-medium">{option.label}</div>
          {option.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {option.description}
            </div>
          )}
        </Label>
      </div>
    ))}
  </RadioGroup>
</div>
```

#### Select Dropdown

```tsx
<div className="space-y-2">
  <Label className="text-sm font-medium">Industry *</Label>
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue placeholder="Select your industry" />
    </SelectTrigger>
    <SelectContent className="custom-scrollbar">
      {industries.map(industry => (
        <SelectItem key={industry.value} value={industry.value}>
          {industry.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Dynamic List Components

#### Services List

```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <Label className="text-sm font-medium">Services & Products</Label>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={addService}
      className="flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Add Service
    </Button>
  </div>

  <div className="space-y-3">
    {services.map((service, index) => (
      <div key={index} className="relative p-4 bg-secondary/20 rounded-lg">
        <div className="absolute top-2 right-2">
          {services.length > 1 && (
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

        <div className="space-y-3 pr-8">
          <Input
            placeholder="Service or product name"
            value={service.name}
            onChange={e => updateService(index, 'name', e.target.value)}
          />
          <Input
            placeholder="URL (optional)"
            type="url"
            value={service.url || ''}
            onChange={e => updateService(index, 'url', e.target.value)}
          />
        </div>
      </div>
    ))}
  </div>
</div>
```

### AI Integration Components

#### AI Suggestion Card

```tsx
<div className="p-4 border border-border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
  <div className="flex items-start gap-3">
    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    </div>

    <div className="flex-1 space-y-3">
      <div>
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
          AI Suggestion
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          {suggestion.content}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ConfidenceIndicator level={suggestion.confidence} />
        <Button size="sm" onClick={onAccept} className="h-7 px-3">
          Use This
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onViewReasoning}
          className="h-7 px-3"
        >
          Why?
        </Button>
      </div>
    </div>
  </div>
</div>
```

#### Confidence Indicator

```tsx
<div className="flex items-center gap-2">
  <div
    className={cn(
      'w-2 h-2 rounded-full',
      confidence >= 0.8
        ? 'bg-green-500'
        : confidence >= 0.6
          ? 'bg-yellow-500'
          : 'bg-orange-500'
    )}
  />
  <span className="text-xs text-muted-foreground">
    {confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low'}{' '}
    confidence
  </span>
</div>
```

## Navigation Components

### Step Navigation Footer

```tsx
<div className="flex items-center justify-between pt-6 border-t border-border">
  <Button
    variant="outline"
    onClick={onPrevious}
    disabled={!canGoBack || isLoading}
    className="flex items-center gap-2"
  >
    <ChevronLeft className="w-4 h-4" />
    Previous
  </Button>

  <div className="flex items-center gap-3">
    <AutoSaveIndicator />
    <Button
      onClick={onNext}
      disabled={!canProceed || isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          {isLastStep ? 'Complete' : 'Continue'}
          <ChevronRight className="w-4 h-4" />
        </>
      )}
    </Button>
  </div>
</div>
```

### Progress Sidebar Navigation

```tsx
<nav className="space-y-2">
  {phases.map(phase => (
    <div key={phase.id} className="space-y-1">
      <button
        onClick={() => onPhaseClick(phase.id)}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
          currentPhase === phase.id
            ? 'bg-primary/10 text-primary'
            : completedPhases.includes(phase.id)
              ? 'bg-muted/50 text-foreground hover:bg-muted'
              : 'text-muted-foreground hover:bg-muted/30'
        )}
        disabled={!canNavigateToPhase(phase.id)}
      >
        <PhaseIcon phase={phase} />
        <div className="flex-1">
          <div className="font-medium">{phase.title}</div>
          <div className="text-xs opacity-75">{phase.description}</div>
        </div>
        <PhaseProgress progress={getPhaseProgress(phase.id)} />
      </button>

      {currentPhase === phase.id && (
        <div className="ml-6 space-y-1">
          {phase.steps.map(step => (
            <button
              key={step.id}
              onClick={() => onStepClick(phase.id, step.id)}
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded text-left text-sm transition-colors',
                currentStep === step.id
                  ? 'bg-primary/20 text-primary'
                  : completedSteps.includes(step.id)
                    ? 'text-foreground hover:bg-muted/50'
                    : 'text-muted-foreground hover:bg-muted/30'
              )}
              disabled={!canNavigateToStep(step.id)}
            >
              <StepIcon step={step} />
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  ))}
</nav>
```

## Validation and Error Handling

### Inline Validation

```tsx
<div className="space-y-2">
  <Label htmlFor="field">Field Label *</Label>
  <div className="relative">
    <Input
      id="field"
      value={value}
      onChange={onChange}
      onBlur={validateField}
      className={cn(
        'pr-10',
        validationState === 'error' && 'border-destructive',
        validationState === 'success' && 'border-green-500'
      )}
    />
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      {validationState === 'validating' && (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      )}
      {validationState === 'error' && (
        <AlertCircle className="w-4 h-4 text-destructive" />
      )}
      {validationState === 'success' && (
        <CheckCircle className="w-4 h-4 text-green-500" />
      )}
    </div>
  </div>
  {errors.map((error, index) => (
    <p key={index} className="text-sm text-destructive">
      {error}
    </p>
  ))}
</div>
```

### Step Validation Summary

```tsx
<Alert
  className={cn(
    'mb-4',
    hasErrors
      ? 'border-destructive/50 text-destructive dark:border-destructive'
      : hasWarnings
        ? 'border-orange-500/50 text-orange-600 dark:border-orange-500'
        : 'border-green-500/50 text-green-600 dark:border-green-500'
  )}
>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>
    {hasErrors
      ? 'Please fix the following issues:'
      : hasWarnings
        ? 'Please review the following:'
        : 'All fields completed successfully!'}
  </AlertTitle>
  <AlertDescription>
    <ul className="mt-2 space-y-1">
      {[...errors, ...warnings].map((message, index) => (
        <li key={index} className="text-sm">
          {message}
        </li>
      ))}
    </ul>
  </AlertDescription>
</Alert>
```

## Loading States and Feedback

### Auto-Save Indicator

```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  {saveState === 'saving' && (
    <>
      <Loader2 className="w-3 h-3 animate-spin" />
      Saving...
    </>
  )}
  {saveState === 'saved' && (
    <>
      <Check className="w-3 h-3 text-green-500" />
      Saved
    </>
  )}
  {saveState === 'error' && (
    <>
      <AlertTriangle className="w-3 h-3 text-red-500" />
      Save failed
    </>
  )}
  {lastSavedTime && <span>Last saved {formatTimeAgo(lastSavedTime)}</span>}
</div>
```

### AI Processing Indicator

```tsx
<div className="flex items-center justify-center p-8">
  <div className="text-center space-y-4">
    <div className="relative">
      <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
      </div>
      <div className="absolute inset-0 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-ping" />
    </div>
    <div>
      <p className="font-medium">AI is analyzing your responses...</p>
      <p className="text-sm text-muted-foreground">
        This may take a few moments
      </p>
    </div>
  </div>
</div>
```

## Responsive Design Patterns

### Mobile-First Form Layout

```tsx
<div className="space-y-6">
  {/* Mobile: Stack everything vertically */}
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {formFields.map(field => (
      <FormField key={field.name} {...field} />
    ))}
  </div>

  {/* Mobile: Full-width buttons */}
  <div className="flex flex-col gap-3 md:flex-row md:justify-between">
    <Button variant="outline" className="w-full md:w-auto">
      Previous
    </Button>
    <Button className="w-full md:w-auto">Continue</Button>
  </div>
</div>
```

### Collapsible Sidebar (Tablet)

```tsx
<div className="relative">
  <Button
    variant="ghost"
    size="sm"
    onClick={toggleSidebar}
    className="md:hidden fixed top-4 left-4 z-50"
  >
    <Menu className="w-4 h-4" />
  </Button>

  <div
    className={cn(
      'fixed inset-y-0 left-0 z-40 w-80 bg-background border-r border-border transform transition-transform duration-200 ease-in-out',
      sidebarCollapsed ? '-translate-x-full' : 'translate-x-0',
      'md:relative md:translate-x-0'
    )}
  >
    <ProgressSidebar />
  </div>

  {/* Overlay for mobile */}
  {!sidebarCollapsed && (
    <div
      className="fixed inset-0 bg-black/50 z-30 md:hidden"
      onClick={toggleSidebar}
    />
  )}
</div>
```

## Accessibility Specifications

### Focus Management

```tsx
useEffect(() => {
  // Focus management for step changes
  const stepTitle = document.querySelector('[data-step-title]');
  if (stepTitle) {
    stepTitle.focus();
  }
}, [currentStep]);

// Focus trap for modals
<FocusTrap active={isModalOpen}>
  <Dialog>
    <DialogContent>{/* Modal content */}</DialogContent>
  </Dialog>
</FocusTrap>;
```

### ARIA Labels and Descriptions

```tsx
<div
  role="tabpanel"
  aria-labelledby={`step-${currentStep}-tab`}
  aria-describedby={`step-${currentStep}-description`}
>
  <h2
    id={`step-${currentStep}-tab`}
    data-step-title
    tabIndex={-1}
    className="text-xl font-semibold mb-2"
  >
    {stepTitle}
  </h2>
  <p
    id={`step-${currentStep}-description`}
    className="text-muted-foreground mb-6"
  >
    {stepDescription}
  </p>
  {/* Step content */}
</div>
```

### Screen Reader Announcements

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcements.map((announcement, index) => (
    <div key={index}>{announcement}</div>
  ))}
</div>
```

## Animation and Transitions

### Step Transitions

```css
.step-transition-enter {
  opacity: 0;
  transform: translateX(20px);
}

.step-transition-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition:
    opacity 300ms ease-in-out,
    transform 300ms ease-in-out;
}

.step-transition-exit {
  opacity: 1;
  transform: translateX(0);
}

.step-transition-exit-active {
  opacity: 0;
  transform: translateX(-20px);
  transition:
    opacity 300ms ease-in-out,
    transform 300ms ease-in-out;
}
```

### Progress Animations

```css
.progress-bar {
  transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-circle {
  stroke-dasharray: 251.2; /* 2 * π * 40 */
  stroke-dashoffset: calc(251.2 * (1 - var(--progress)));
  transition: stroke-dashoffset 500ms ease-in-out;
}
```

This comprehensive UI/UX specification provides the foundation for implementing a cohesive, accessible, and user-friendly business onboarding experience that follows established design patterns and modern best practices.
