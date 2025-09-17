'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Languages,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question } from '@/app/actions/questions';
import { QuestionForm } from '@/components/forms/question-form';
import { DeleteQuestionDialog } from '@/components/admin/delete-question-dialog';
import { CloneTranslateModal } from '@/components/forms/clone-translate-modal';

interface QuestionsTableProps {
  questions: Question[];
  onQuestionUpdate?: (question: Question) => void;
  onQuestionDelete?: (questionId: string) => void;
}

const ITEMS_PER_PAGE = 50;

export function QuestionsTable({ questions, onQuestionUpdate, onQuestionDelete }: QuestionsTableProps) {
  const [sortField, setSortField] = useState<'title' | 'module' | 'question_type'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Helper function to check if a master question has translations
  const hasTranslations = (masterQuestionId: string) => {
    return questions.some(q => q.parent_question_id === masterQuestionId);
  };

  // Helper function to get master question for a translation
  const getMasterQuestion = (parentId: string | null) => {
    if (!parentId) return null;
    return questions.find(q => q.id === parentId);
  };

  // Helper function to get translations for a master question
  const getTranslations = (masterQuestionId: string) => {
    return questions.filter(q => q.parent_question_id === masterQuestionId);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort questions
  const sortedQuestions = [...questions].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'module':
        // Handle module sorting with fallback to master question's module
        const aModule = a.module || (a.parent_question_id ? getMasterQuestion(a.parent_question_id)?.module : null);
        const bModule = b.module || (b.parent_question_id ? getMasterQuestion(b.parent_question_id)?.module : null);
        aValue = aModule?.name?.toLowerCase() || '';
        bValue = bModule?.name?.toLowerCase() || '';
        break;
      case 'question_type':
        aValue = a.question_type;
        bValue = b.question_type;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedQuestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedQuestions = sortedQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  if (questions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg mb-4">No questions found</p>
        <p className="text-sm text-muted-foreground mb-6">
          Create your first question to start building questionnaires
        </p>
        <QuestionForm
          trigger={
            <Button>
              Create First Question
            </Button>
          }
          onSuccess={onQuestionUpdate}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Title
                  {getSortIcon('title')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('module')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Module
                  {getSortIcon('module')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('question_type')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Category
                  {getSortIcon('question_type')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Language
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Type
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Master
              </th>
              <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuestions.map((question) => (
              <tr key={question.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2">
                  <Link 
                    href={`/admin/questions/${question.id}`}
                    className="font-medium text-sm hover:text-primary hover:underline cursor-pointer"
                  >
                    {question.title}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {(() => {
                    // Get module info - if translation has no module, get from master question
                    const moduleInfo = question.module || (question.parent_question_id ? getMasterQuestion(question.parent_question_id)?.module : null);

                    return moduleInfo ? (
                      <Link
                        href={`/modules/${moduleInfo.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {moduleInfo.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    );
                  })()}
                </td>
                <td className="px-4 py-2">
                  <Badge
                    variant="outline"
                    className="capitalize text-xs bg-blue-500/10 text-blue-500 border-blue-500/20"
                  >
                    {question.question_type === 'foundational' ? 'foundational' :
                     question.question_type === 'strategic' ? 'strategic' :
                     question.question_type === 'operational' ? 'operational' :
                     question.question_type === 'assessment' ? 'assessment' :
                     question.question_type}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <Badge
                    variant={question.is_master ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {(question.content_language || 'en').toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  {question.is_master ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        hasTranslations(question.id)
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      )}
                    >
                      Master {hasTranslations(question.id) ? '(Translated)' : ''}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Translation
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2">
                  {!question.is_master && question.parent_question_id ? (
                    <div className="text-sm text-muted-foreground">
                      {getMasterQuestion(question.parent_question_id)?.title || 'Unknown Master'}
                    </div>
                  ) : question.is_master && hasTranslations(question.id) ? (
                    <div className="flex flex-col gap-1">
                      {getTranslations(question.id).map(translation => (
                        <div key={translation.id} className="text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs mr-1">
                            {(translation.content_language || 'en').toUpperCase()}
                          </Badge>
                          {translation.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View question"
                      asChild
                    >
                      <Link href={`/admin/questions/${question.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                    <QuestionForm
                      question={question}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit question"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      }
                      onSuccess={(updatedQuestion) => {
                        onQuestionUpdate?.(updatedQuestion);
                      }}
                    />
                    {question.is_master && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0",
                          hasTranslations(question.id)
                            ? "text-green-600 hover:text-green-700"
                            : "text-blue-600 hover:text-blue-700"
                        )}
                        title={
                          hasTranslations(question.id)
                            ? "Master question with translations - Clone for additional languages"
                            : "Master question (no translations yet) - Clone & translate"
                        }
                        onClick={() => {
                          setSelectedQuestion(question);
                          setCloneModalOpen(true);
                        }}
                      >
                        <Languages className="h-3 w-3" />
                      </Button>
                    )}
                    <DeleteQuestionDialog
                      questionId={question.id}
                      questionLabel={question.title}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete question"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      }
                      onSuccess={() => {
                        onQuestionDelete?.(question.id);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, questions.length)} of {questions.length} questions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={i}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Clone Translation Modal */}
      {selectedQuestion && (
        <CloneTranslateModal
          open={cloneModalOpen}
          onOpenChange={setCloneModalOpen}
          masterQuestion={selectedQuestion}
          availableLanguages={['de', 'es', 'fr', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']}
          onSuccess={(clonedQuestion) => {
            setCloneModalOpen(false);
            setSelectedQuestion(null);
            onQuestionUpdate?.(clonedQuestion);
          }}
        />
      )}
    </Card>
  );
}