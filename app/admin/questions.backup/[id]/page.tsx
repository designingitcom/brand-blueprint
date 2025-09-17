'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Link2,
  Lightbulb,
  HelpCircle,
  Loader2,
  AlertCircle,
  Languages,
  Plus,
  Globe
} from 'lucide-react';
import { QuestionForm } from '@/components/forms/question-form';
import { DeleteQuestionDialog } from '@/components/admin/delete-question-dialog';
import { CloneTranslateModal } from '@/components/forms/clone-translate-modal';
import { getQuestion, getQuestions, getQuestionsWithLanguages, Question } from '@/app/actions/questions';
import { cn } from '@/lib/utils';

export default function QuestionDetailPage() {
  const params = useParams();
  const questionId = params.id as string;
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [prerequisiteQuestions, setPrerequisiteQuestions] = useState<Question[]>([]);
  const [translations, setTranslations] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cloneModalOpen, setCloneModalOpen] = useState(false);

  const loadQuestion = async () => {
      try {
        const [questionResult, questionsResult, questionsWithLangResult] = await Promise.all([
          getQuestion(questionId),
          getQuestions(),
          getQuestionsWithLanguages()
        ]);

        if (questionResult.success && questionResult.data) {
          setQuestion(questionResult.data);

          // Load translations if this is a master question
          if (questionResult.data.is_master && questionsWithLangResult.data) {
            const questionTranslations = questionsWithLangResult.data.filter(
              q => q.parent_question_id === questionResult.data.id
            );
            setTranslations(questionTranslations);
          }

          // Load prerequisite questions if they exist
          if (questionResult.data.prerequisites && questionResult.data.prerequisites.length > 0) {
            if (questionsResult.success && questionsResult.data) {
              const prerequisites = questionsResult.data.filter(q =>
                questionResult.data.prerequisites?.includes(q.id)
              );
              setPrerequisiteQuestions(prerequisites);
            }
          }
        } else {
          setError(questionResult.error || 'Question not found');
        }
      } catch (err) {
        setError('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  const handleQuestionUpdate = async (updatedQuestion: Question) => {
    setQuestion(updatedQuestion);
    
    // Reload prerequisite questions if they changed
    if (updatedQuestion.prerequisites && updatedQuestion.prerequisites.length > 0) {
      try {
        const questionsResult = await getQuestions();
        if (questionsResult.success && questionsResult.data) {
          const prerequisites = questionsResult.data.filter(q => 
            updatedQuestion.prerequisites?.includes(q.id)
          );
          setPrerequisiteQuestions(prerequisites);
        }
      } catch (err) {
        console.error('Failed to reload prerequisites:', err);
      }
    } else {
      setPrerequisiteQuestions([]);
    }
  };

  const getCategoryColor = (type: string) => {
    const colors = {
      foundational: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      strategic: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      operational: 'bg-green-500/10 text-green-500 border-green-500/20',
      assessment: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      standard: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[type as keyof typeof colors] || colors.standard;
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Loading question details"
      >
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !question) {
    return (
      <DashboardLayout
        title="Question Not Found"
        subtitle="The requested question could not be found"
      >
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Question Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/admin/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={question.title}
      subtitle={`Question in ${question.module?.name || 'No Module'}`}
      actions={
        <div className="flex gap-2">
          <QuestionForm
            question={question}
            trigger={
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            }
            onSuccess={handleQuestionUpdate}
          />
          <DeleteQuestionDialog
            questionId={question.id}
            questionLabel={question.title}
            trigger={
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            }
            onSuccess={() => {
              // Redirect to questions list after deletion
              window.location.href = '/admin/questions';
            }}
          />
          <Button variant="outline" asChild>
            <Link href="/admin/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Question Overview */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", getCategoryColor(question.question_type))}
                  >
                    {question.question_type}
                  </Badge>
                  {question.module && (
                    <Badge variant="outline">
                      {question.module.name}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold">{question.title}</h1>
              </div>
              <div className="text-sm text-muted-foreground">
                ID: {question.id}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Definition
                </h3>
                <p className="text-sm">{question.definition}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Why It Matters
                </h3>
                <p className="text-sm">{question.why_it_matters}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">
                In Simple Terms
              </h3>
              <p className="text-sm">{question.simple_terms}</p>
            </div>
          </div>
        </Card>

        {/* Prerequisites & Dependencies */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Prerequisites ({prerequisiteQuestions.length})
            </h3>
            <QuestionForm
              question={question}
              trigger={
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {prerequisiteQuestions.length > 0 ? 'Edit Prerequisites' : 'Add Prerequisites'}
                </Button>
              }
              onSuccess={handleQuestionUpdate}
            />
          </div>
          
          {prerequisiteQuestions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                These questions must be answered before this one:
              </p>
              <div className="space-y-3">
                {prerequisiteQuestions.map((prereq) => (
                  <div
                    key={prereq.id}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/admin/questions/${prereq.id}`}
                        className="font-medium text-sm text-primary hover:underline"
                      >
                        {prereq.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {prereq.definition}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {prereq.question_type}
                        </Badge>
                        {prereq.module && (
                          <Badge variant="outline" className="text-xs">
                            {prereq.module.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Link 
                      href={`/admin/questions/${prereq.id}`}
                      className="text-primary hover:text-primary/80 flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-sm font-medium mb-2">No Prerequisites Set</h4>
              <p className="text-sm text-muted-foreground mb-4">
                This question has no prerequisite questions. You can add some to create a learning sequence.
              </p>
            </div>
          )}
        </Card>

        {/* Examples */}
        {question.examples && question.examples.length > 0 && (
          <Card className="p-6">
            <h3 className="font-medium mb-4">
              Examples ({question.examples.length})
            </h3>
            <div className="space-y-3">
              {question.examples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <p className="text-sm">{example}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Translations */}
        {question.is_master && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Translations ({translations.length})
              </h3>
              <Button
                onClick={() => setCloneModalOpen(true)}
                size="sm"
                className={cn(
                  translations.length > 0
                    ? "text-green-600 hover:text-green-700 border-green-500"
                    : "text-blue-600 hover:text-blue-700 border-blue-500"
                )}
                variant="outline"
              >
                <Languages className="h-4 w-4 mr-2" />
                {translations.length > 0 ? 'Add More Translations' : 'Translate This Question'}
              </Button>
            </div>

            {translations.length > 0 ? (
              <div className="space-y-3">
                {translations.map((translation) => (
                  <div
                    key={translation.id}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {(translation.content_language || 'en').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Translation
                        </Badge>
                      </div>
                      <Link
                        href={`/admin/questions/${translation.id}`}
                        className="font-medium text-sm text-primary hover:underline"
                      >
                        {translation.title}
                      </Link>
                      {translation.definition && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {translation.definition}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {translation.module && (
                          <Badge variant="outline" className="text-xs">
                            {translation.module.name}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {translation.question_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/questions/${translation.id}`}
                        className="text-primary hover:text-primary/80 flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <QuestionForm
                        question={translation}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        }
                        onSuccess={(updatedQuestion) => {
                          setTranslations(prev =>
                            prev.map(t => t.id === updatedQuestion.id ? updatedQuestion : t)
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-sm font-medium mb-2">No Translations Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This question hasn't been translated into other languages yet.
                  Add translations to make it accessible to a wider audience.
                </p>
                <Button
                  onClick={() => setCloneModalOpen(true)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Translation
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Settings */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Confidence Calibration Score</span>
              </div>
              <Badge variant="default">
                {question.confidence_calibration_score || 7} / 10 ({((question.confidence_calibration_score || 7) * 10)}%)
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm">AI Assistance</span>
              </div>
              <Badge variant={question.ai_assistance_enabled ? "default" : "outline"}>
                {question.ai_assistance_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Sort Order:</span>
              <span className="ml-2 font-mono">{question.sort_order}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2">{new Date(question.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Associated Modules:</span>
              <span className="ml-2">
                {question.module ? (
                  <Badge variant="outline" className="ml-1">
                    {question.module.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Clone Translation Modal */}
      {question && question.is_master && (
        <CloneTranslateModal
          open={cloneModalOpen}
          onOpenChange={setCloneModalOpen}
          masterQuestion={question}
          availableLanguages={['de', 'es', 'fr', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']}
          onSuccess={(clonedQuestion) => {
            setCloneModalOpen(false);
            // Reload translations
            loadQuestion();
          }}
        />
      )}
    </DashboardLayout>
  );
}