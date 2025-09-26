'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Languages, Plus } from 'lucide-react';
import { Question } from '@/app/actions/questions';

interface LanguageVersionSelectorProps {
  currentQuestion: Question;
  onVersionChange?: (questionId: string) => void;
  onCloneForTranslation?: (masterId: string, targetLanguage: string) => void;
  availableLanguages?: string[];
}

export function LanguageVersionSelector({
  currentQuestion,
  onVersionChange,
  onCloneForTranslation,
  availableLanguages = ['en', 'de', 'es', 'fr']
}: LanguageVersionSelectorProps) {
  const router = useRouter();
  const [allVersions, setAllVersions] = useState<Question[]>([]);
  const [missingLanguages, setMissingLanguages] = useState<string[]>([]);

  useEffect(() => {
    // Build the complete family of language versions
    const versions: Question[] = [];

    if (currentQuestion.is_master) {
      // If current is master, add it and its language versions
      versions.push(currentQuestion);
      if (currentQuestion.language_versions) {
        versions.push(...currentQuestion.language_versions);
      }
    } else {
      // If current is a translation, we need to find the master
      // For now, just show the current question
      versions.push(currentQuestion);
    }

    setAllVersions(versions);

    // Calculate missing languages
    const existingLanguages = versions.map(v => v.content_language || 'en');
    const missing = availableLanguages.filter(lang => !existingLanguages.includes(lang));
    setMissingLanguages(missing);
  }, [currentQuestion, availableLanguages]);

  const handleVersionChange = (questionId: string) => {
    if (onVersionChange) {
      onVersionChange(questionId);
    } else {
      // Default behavior: navigate to question
      router.push(`/admin/questions/${questionId}`);
    }
  };

  const handleCloneClick = (targetLanguage: string) => {
    const masterId = currentQuestion.is_master ? currentQuestion.id : currentQuestion.parent_question_id;
    if (masterId && onCloneForTranslation) {
      onCloneForTranslation(masterId, targetLanguage);
    }
  };

  const currentLanguage = currentQuestion.content_language || 'en';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Language:</span>
      </div>

      {/* Language Version Selector */}
      <Select value={currentQuestion.id} onValueChange={handleVersionChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentLanguage.toUpperCase()}
              </Badge>
              <span>{currentQuestion.title}</span>
              {!currentQuestion.is_master && (
                <Languages className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allVersions.map(version => (
            <SelectItem key={version.id} value={version.id}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {(version.content_language || 'en').toUpperCase()}
                </Badge>
                <span className="flex-1">{version.title}</span>
                {version.is_master && (
                  <Badge variant="secondary" className="text-xs">
                    Master
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clone for Translation Buttons */}
      {missingLanguages.length > 0 && onCloneForTranslation && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Add:</span>
          {missingLanguages.map(lang => (
            <Button
              key={lang}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleCloneClick(lang)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {lang.toUpperCase()}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Example usage in a question detail page:
// <LanguageVersionSelector
//   currentQuestion={question}
//   onVersionChange={(questionId) => router.push(`/questions/${questionId}`)}
//   onCloneForTranslation={(masterId, targetLang) => {
//     // Open clone/translate modal
//     setCloneModalOpen({ masterId, targetLang });
//   }}
//   availableLanguages={['en', 'de', 'es', 'fr']}
// />