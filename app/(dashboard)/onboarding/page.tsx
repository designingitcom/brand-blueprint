"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BusinessSetup } from "./components/business-setup"
import { ProjectSetup } from "./components/project-setup"
import { TeamInvite } from "./components/team-invite"
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

const STEPS = [
  {
    id: 1,
    title: "Business Details",
    description: "Set up your business information",
    component: BusinessSetup,
  },
  {
    id: 2,
    title: "First Project",
    description: "Create your first brand project",
    component: ProjectSetup,
  },
  {
    id: 3,
    title: "Invite Team",
    description: "Invite team members to collaborate",
    component: TeamInvite,
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const router = useRouter()

  const currentStepData = STEPS.find(step => step.id === currentStep)
  const progress = ((currentStep - 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCompletedSteps(prev => [...prev, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      // Completed all steps
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleFinish = () => {
    setCompletedSteps(prev => [...prev, currentStep])
    router.push("/dashboard")
  }

  const isLastStep = currentStep === STEPS.length
  const CurrentStepComponent = currentStepData?.component

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome to S1BMW!</h1>
          <p className="text-muted-foreground mt-2">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((completedSteps.length / STEPS.length) * 100)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            
            return (
              <div
                key={step.id}
                className="flex items-center"
              >
                <div className={`
                  flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium
                  ${isCurrent 
                    ? "bg-primary text-primary-foreground" 
                    : isCompleted 
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{currentStepData?.title}</CardTitle>
            <CardDescription>
              {currentStepData?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {CurrentStepComponent && (
              <CurrentStepComponent 
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                onFinish={handleFinish}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={isLastStep ? handleFinish : handleNext}>
              {isLastStep ? "Finish" : "Continue"}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}