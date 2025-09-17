'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { QuestionInterface } from '@/components/workshop/question-interface';
import { useWorkshopStore } from '@/lib/store/workshop-store';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

// Mock data - replace with actual API calls
const MOCK_MODULES = [
  {
    id: 'm1',
    code: 'M1',
    name: 'Business Model',
    category: 'Foundation',
    description: 'Define your business model and value proposition',
    order: 1,
    totalQuestions: 5,
    completedQuestions: 2,
    progress: 40,
    status: 'in_progress' as const,
  },
  {
    id: 'm2',
    code: 'M2',
    name: 'DNA Exploration',
    category: 'Foundation',
    description: 'Explore your brand DNA and core values',
    order: 2,
    totalQuestions: 9,
    completedQuestions: 0,
    progress: 0,
    status: 'not_started' as const,
  },
  {
    id: 'm3',
    code: 'M3',
    name: 'Target Audience',
    category: 'Strategy',
    description: 'Define and understand your target audience',
    order: 3,
    totalQuestions: 6,
    completedQuestions: 0,
    progress: 0,
    status: 'not_started' as const,
  },
];

const MOCK_QUESTIONS = [
  {
    id: 'q1',
    moduleId: 'm2',
    moduleName: 'DNA Exploration',
    order: 1,
    title: 'Purpose Statement',
    description:
      "What's our brand's purpose, and does it match our leadership's beliefs?",
    examples: [
      'Nike: "To bring inspiration and innovation to every athlete in the world"',
      'Tesla: "To accelerate the world\'s transition to sustainable energy"',
    ],
    whyItMatters:
      'Your purpose drives all strategic decisions and helps attract customers and employees who share your values.',
    framework: {
      suggestions: [
        "Simon Sinek's 'Why' framework",
        'Purpose-driven positioning',
      ],
      kidFriendly: 'If your brand was a superhero, what would its mission be?',
      alternativeFormats: [
        'Write it as a manifesto',
        'Create a one-sentence rally cry',
        'Design it as a vision board',
      ],
    },
  },
  {
    id: 'q2',
    moduleId: 'm2',
    moduleName: 'DNA Exploration',
    order: 2,
    title: 'Core Values',
    description:
      'What are the 3-5 core values that guide every decision your brand makes?',
    examples: [
      'Patagonia: Environmental stewardship, Quality, Integrity',
      'Apple: Innovation, Simplicity, User Experience',
    ],
    whyItMatters:
      'Core values act as your decision-making compass and shape your company culture.',
    framework: {
      kidFriendly:
        'What are the most important rules your brand always follows?',
      alternativeFormats: [
        'Create value statements with definitions',
        'Write them as principles',
        'Express them as behaviors',
      ],
    },
  },
];

export default function WorkshopPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const {
    setCurrentProject,
    loadModules,
    loadQuestions,
    modules,
    currentModuleId,
    currentQuestionId,
    setCurrentModule,
    setCurrentQuestion,
  } = useWorkshopStore();

  const [projectInfo, setProjectInfo] = useState({
    name: 'Brand Audit',
    client: 'BDM/A',
    progress: 65,
  });

  useEffect(() => {
    // Initialize project and load data
    setCurrentProject(projectId);
    loadModules(MOCK_MODULES);
    loadQuestions(MOCK_QUESTIONS);

    // Set initial question if none selected
    if (!currentQuestionId && MOCK_QUESTIONS.length > 0) {
      setCurrentQuestion(MOCK_QUESTIONS[0].id);
      setCurrentModule(MOCK_QUESTIONS[0].moduleId);
    }
  }, [projectId]);

  const currentModule = modules.find(m => m.id === currentModuleId);
  const moduleQuestions = MOCK_QUESTIONS.filter(
    q => q.moduleId === currentModuleId
  );

  return (
    <DashboardLayout
      title={projectInfo.name}
      subtitle={`${projectInfo.client} • Progress: ${projectInfo.progress}%`}
    >
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Left Sidebar - Module Navigation */}
        <div className="w-80 border-r border-border overflow-y-auto">
          {/* Progress Bar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {projectInfo.progress}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${projectInfo.progress}%` }}
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="p-4 space-y-2">
            {modules.map(module => {
              const isActive = module.id === currentModuleId;
              const isCompleted = module.status === 'completed';
              const isLocked = module.order > 3; // Mock locked state

              return (
                <button
                  key={module.id}
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentModule(module.id);
                      const firstQuestion = MOCK_QUESTIONS.find(
                        q => q.moduleId === module.id
                      );
                      if (firstQuestion) {
                        setCurrentQuestion(firstQuestion.id);
                      }
                    }
                  }}
                  disabled={isLocked}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all duration-200',
                    isActive && 'bg-primary/10 border-primary',
                    !isActive &&
                      !isLocked &&
                      'bg-card border-border hover:bg-secondary/50',
                    isLocked &&
                      'bg-card/50 border-border/50 cursor-not-allowed opacity-50',
                    isCompleted &&
                      !isActive &&
                      'border-green-500/30 bg-green-500/5'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {module.code}
                      </span>
                      <h3 className="font-semibold text-sm">{module.name}</h3>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {isLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {module.description}
                  </p>

                  {!isLocked && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {module.completedQuestions}/{module.totalQuestions}{' '}
                          Questions
                        </span>
                        <span className="text-xs font-medium">
                          {module.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            isCompleted ? 'bg-green-500' : 'bg-primary'
                          )}
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Module Questions */}
          {currentModule && moduleQuestions.length > 0 && (
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
                {currentModule.name} Questions
              </h4>
              <div className="space-y-1">
                {moduleQuestions.map((question, index) => {
                  const isCurrentQuestion = question.id === currentQuestionId;
                  // Mock completion state
                  const isCompleted = index < 2;

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestion(question.id)}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors',
                        isCurrentQuestion && 'bg-primary/10 text-primary',
                        !isCurrentQuestion && 'hover:bg-secondary/50'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="truncate">{question.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Content - Question Interface */}
        <div className="flex-1 overflow-hidden">
          <QuestionInterface />
        </div>
      </div>
    </DashboardLayout>
  );
}
