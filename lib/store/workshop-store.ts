import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Question {
  id: string;
  moduleId: string;
  moduleName: string;
  order: number;
  title: string;
  description: string;
  examples?: string[];
  whyItMatters?: string;
  framework?: {
    suggestions?: string[];
    examples?: string[];
    tips?: string[];
    kidFriendly?: string;
    alternativeFormats?: string[];
  };
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  confidence: number;
  status: 'draft' | 'saved' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  order: number;
  totalQuestions: number;
  completedQuestions: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface WorkshopState {
  // Current session
  currentProjectId: string | null;
  currentModuleId: string | null;
  currentQuestionId: string | null;

  // Data
  modules: Module[];
  questions: Question[];
  answers: Record<string, Answer[]>; // questionId -> answers[]

  // AI Assistant
  aiPanelOpen: boolean;
  aiHistory: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;

  // Actions
  setCurrentProject: (projectId: string) => void;
  setCurrentModule: (moduleId: string) => void;
  setCurrentQuestion: (questionId: string) => void;

  // Module actions
  loadModules: (modules: Module[]) => void;
  updateModuleProgress: (moduleId: string) => void;

  // Question actions
  loadQuestions: (questions: Question[]) => void;
  getCurrentQuestion: () => Question | null;
  getNextQuestion: () => Question | null;
  getPreviousQuestion: () => Question | null;

  // Answer actions
  saveAnswer: (questionId: string, content: string, confidence: number) => void;
  updateAnswer: (answerId: string, content: string, confidence: number) => void;
  approveAnswer: (answerId: string) => void;
  getLatestAnswer: (questionId: string) => Answer | null;

  // AI actions
  toggleAIPanel: () => void;
  addAIMessage: (role: 'user' | 'assistant', content: string) => void;
  clearAIHistory: () => void;

  // Navigation
  navigateToQuestion: (questionId: string) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
}

export const useWorkshopStore = create<WorkshopState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProjectId: null,
      currentModuleId: null,
      currentQuestionId: null,
      modules: [],
      questions: [],
      answers: {},
      aiPanelOpen: true,
      aiHistory: [],

      // Session setters
      setCurrentProject: projectId => set({ currentProjectId: projectId }),
      setCurrentModule: moduleId => set({ currentModuleId: moduleId }),
      setCurrentQuestion: questionId => set({ currentQuestionId: questionId }),

      // Module actions
      loadModules: modules => set({ modules }),

      updateModuleProgress: moduleId =>
        set(state => {
          const targetModule = state.modules.find(m => m.id === moduleId);
          if (!targetModule) return state;

          const moduleQuestions = state.questions.filter(
            q => q.moduleId === moduleId
          );
          const completedQuestions = moduleQuestions.filter(q =>
            state.answers[q.id]?.some(a => a.status === 'approved')
          ).length;

          const progress =
            moduleQuestions.length > 0
              ? Math.round((completedQuestions / moduleQuestions.length) * 100)
              : 0;

          const status =
            progress === 0
              ? 'not_started'
              : progress === 100
                ? 'completed'
                : 'in_progress';

          return {
            modules: state.modules.map(m =>
              m.id === moduleId
                ? { ...m, completedQuestions, progress, status }
                : m
            ),
          };
        }),

      // Question actions
      loadQuestions: questions => set({ questions }),

      getCurrentQuestion: () => {
        const state = get();
        return (
          state.questions.find(q => q.id === state.currentQuestionId) || null
        );
      },

      getNextQuestion: () => {
        const state = get();
        const currentQuestion = state.getCurrentQuestion();
        if (!currentQuestion) return null;

        const moduleQuestions = state.questions
          .filter(q => q.moduleId === currentQuestion.moduleId)
          .sort((a, b) => a.order - b.order);

        const currentIndex = moduleQuestions.findIndex(
          q => q.id === currentQuestion.id
        );
        return moduleQuestions[currentIndex + 1] || null;
      },

      getPreviousQuestion: () => {
        const state = get();
        const currentQuestion = state.getCurrentQuestion();
        if (!currentQuestion) return null;

        const moduleQuestions = state.questions
          .filter(q => q.moduleId === currentQuestion.moduleId)
          .sort((a, b) => a.order - b.order);

        const currentIndex = moduleQuestions.findIndex(
          q => q.id === currentQuestion.id
        );
        return moduleQuestions[currentIndex - 1] || null;
      },

      // Answer actions
      saveAnswer: (questionId, content, confidence) =>
        set(state => {
          const newAnswer: Answer = {
            id: `answer-${Date.now()}`,
            questionId,
            content,
            confidence,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            answers: {
              ...state.answers,
              [questionId]: [...(state.answers[questionId] || []), newAnswer],
            },
          };
        }),

      updateAnswer: (answerId, content, confidence) =>
        set(state => {
          const updatedAnswers = { ...state.answers };

          for (const questionId in updatedAnswers) {
            updatedAnswers[questionId] = updatedAnswers[questionId].map(
              answer =>
                answer.id === answerId
                  ? { ...answer, content, confidence, updatedAt: new Date() }
                  : answer
            );
          }

          return { answers: updatedAnswers };
        }),

      approveAnswer: answerId =>
        set(state => {
          const updatedAnswers = { ...state.answers };

          for (const questionId in updatedAnswers) {
            updatedAnswers[questionId] = updatedAnswers[questionId].map(
              answer =>
                answer.id === answerId
                  ? {
                      ...answer,
                      status: 'approved' as const,
                      updatedAt: new Date(),
                    }
                  : answer
            );
          }

          return { answers: updatedAnswers };
        }),

      getLatestAnswer: questionId => {
        const state = get();
        const questionAnswers = state.answers[questionId] || [];
        return (
          questionAnswers.sort(
            (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
          )[0] || null
        );
      },

      // AI actions
      toggleAIPanel: () => set(state => ({ aiPanelOpen: !state.aiPanelOpen })),

      addAIMessage: (role, content) =>
        set(state => ({
          aiHistory: [
            ...state.aiHistory,
            {
              id: `msg-${Date.now()}`,
              role,
              content,
              timestamp: new Date(),
            },
          ],
        })),

      clearAIHistory: () => set({ aiHistory: [] }),

      // Navigation
      navigateToQuestion: questionId => {
        const state = get();
        const question = state.questions.find(q => q.id === questionId);
        if (question) {
          set({
            currentQuestionId: questionId,
            currentModuleId: question.moduleId,
          });
        }
      },

      navigateNext: () => {
        const state = get();
        const nextQuestion = state.getNextQuestion();
        if (nextQuestion) {
          state.navigateToQuestion(nextQuestion.id);
        }
      },

      navigatePrevious: () => {
        const state = get();
        const prevQuestion = state.getPreviousQuestion();
        if (prevQuestion) {
          state.navigateToQuestion(prevQuestion.id);
        }
      },
    }),
    {
      name: 'workshop-storage',
      partialize: state => ({
        currentProjectId: state.currentProjectId,
        currentModuleId: state.currentModuleId,
        currentQuestionId: state.currentQuestionId,
        answers: state.answers,
        aiPanelOpen: state.aiPanelOpen,
      }),
    }
  )
);
