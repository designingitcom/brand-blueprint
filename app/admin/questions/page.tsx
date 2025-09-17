'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import {
  Plus,
  HelpCircle,
  List,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { QuestionForm } from '@/components/forms/question-form';
import { QuestionsTable } from '@/components/admin/questions-table';
import { getQuestions, getQuestionsWithLanguages, Question, QuestionType } from '@/app/actions/questions';
import { getModules, Module } from '@/app/actions/modules';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages } from 'lucide-react';


export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedRequired, setSelectedRequired] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showMasterOnly, setShowMasterOnly] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [questionsResult, modulesResult] = await Promise.all([
          getQuestionsWithLanguages(
            selectedLanguage !== 'all' ? selectedLanguage : undefined,
            showMasterOnly
          ),
          getModules()
        ]);

        if (questionsResult.error) {
          setError(questionsResult.error);
        } else {
          const questionsData = questionsResult.data || [];
          setQuestions(questionsData);

          // Extract available languages
          const languages = [...new Set(questionsData.map(q => q.content_language || 'en'))];
          setAvailableLanguages(languages.sort());
        }

        if (modulesResult && Array.isArray(modulesResult)) {
          setModules(modulesResult);
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedLanguage, showMasterOnly]);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.definition || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.module?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = true; // Remove type filtering
    const matchesModule =
      selectedModule === 'all' ||
      question.module?.id === selectedModule;
    const matchesRequired = selectedRequired === 'all' ||
      (selectedRequired === 'required' && question.required) ||
      (selectedRequired === 'optional' && !question.required);
    const matchesLanguage = selectedLanguage === 'all' ||
      (question.content_language || 'en') === selectedLanguage;
    const matchesMasterOnly = !showMasterOnly || question.is_master;

    return matchesSearch && matchesModule && matchesRequired && matchesLanguage && matchesMasterOnly;
  });

  // Calculate stats from real data
  const masterQuestions = questions.filter(q => q.is_master);
  const translatedQuestions = questions.filter(q => !q.is_master);

  const questionStats = [
    { label: 'Total Questions', value: questions.length.toString(), icon: HelpCircle },
    { label: 'Master Questions', value: masterQuestions.length.toString(), icon: CheckCircle2 },
    { label: 'Translations', value: translatedQuestions.length.toString(), icon: Languages },
    { label: 'Languages', value: availableLanguages.length.toString(), icon: Globe },
  ];

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
  };

  const handleQuestionCreate = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
  };

  const handleQuestionDelete = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  return (
    <DashboardLayout
      title="Questions"
      subtitle="Manage all questions across modules"
      actions={
        <QuestionForm
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Question
            </Button>
          }
          onSuccess={handleQuestionCreate}
        />
      }
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {questionStats.map(stat => (
            <KPICard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              changeLabel="this month"
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Languages</option>
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Master Only Toggle */}
            <label className="flex items-center gap-2 h-10 px-4 rounded-lg border border-input bg-card text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showMasterOnly}
                onChange={e => setShowMasterOnly(e.target.checked)}
                className="rounded"
              />
              <span>Masters Only</span>
            </label>

            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Questions</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          /* Questions Table */
          <QuestionsTable 
            questions={filteredQuestions}
            onQuestionUpdate={handleQuestionUpdate}
            onQuestionDelete={handleQuestionDelete}
          />
        )}

        {/* Empty State - Only show when there are questions but none match filters */}
        {!loading && !error && questions.length > 0 && filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}