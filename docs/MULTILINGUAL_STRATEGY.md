# Multilingual Strategy for S1BMW Brand Management

## Overview
This document outlines our approach to handling multiple languages in both UI and database content.

## 1. UI Translation Strategy (Static Content)

### Current Status
- ✅ Infrastructure setup with next-intl
- ✅ Language switcher implemented
- ⚠️ Only ~20% of UI strings translated
- ❌ Most forms still have hardcoded English strings

### Implementation Plan
All UI text must use translation keys:

```typescript
// ❌ Bad - Hardcoded string
<Label>Question Title</Label>

// ✅ Good - Translation key
<Label>{t('questions.form.title')}</Label>
```

### Translation File Structure
```
/i18n/messages/
├── en.json       # English (base language)
├── de.json       # German
├── es.json       # Spanish (future)
└── fr.json       # French (future)
```

## 2. Database Content Strategy

### Chosen Approach: Content Preserves Original Language

**Principle:** Content remains in the language it was created in. The interface language only affects UI elements, not user-generated content.

### Database Schema Enhancement

```sql
-- Add language tracking to all content tables
ALTER TABLE questions ADD COLUMN content_language VARCHAR(2) DEFAULT 'en';
ALTER TABLE answers ADD COLUMN content_language VARCHAR(2) DEFAULT 'en';
ALTER TABLE businesses ADD COLUMN content_language VARCHAR(2) DEFAULT 'en';
ALTER TABLE projects ADD COLUMN content_language VARCHAR(2) DEFAULT 'en';
ALTER TABLE strategies ADD COLUMN content_language VARCHAR(2) DEFAULT 'en';

-- Optional: Add translation support
CREATE TABLE content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  original_language VARCHAR(2) NOT NULL,
  target_language VARCHAR(2) NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  translation_method VARCHAR(20), -- 'manual', 'ai', 'professional'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(table_name, record_id, field_name, target_language)
);
```

### Implementation Details

#### 1. Track Content Language on Input
```typescript
// When creating content, detect and store the language
const createQuestion = async (data: QuestionData) => {
  const userLocale = getUserLocale(); // Get from session/context

  return await supabase.from('questions').insert({
    ...data,
    content_language: userLocale, // Store the language
  });
};
```

#### 2. Display Language Indicators
```typescript
// Show a small flag/badge indicating content language
<div className="flex items-center gap-2">
  <span>{question.text}</span>
  {question.content_language !== currentLocale && (
    <Badge variant="outline" className="text-xs">
      {question.content_language.toUpperCase()}
    </Badge>
  )}
</div>
```

#### 3. Optional Translation Button
```typescript
// Offer translation for content in different languages
{question.content_language !== currentLocale && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => translateContent(question.text)}
  >
    <Globe className="h-3 w-3 mr-1" />
    Translate
  </Button>
)}
```

## 3. Practical Examples

### Scenario 1: German User Creates Content
1. User has interface set to German (UI shows German text)
2. User writes question: "Was ist Ihre Markenvision?"
3. System stores:
   - `text`: "Was ist Ihre Markenvision?"
   - `content_language`: "de"
4. English user sees:
   - German question text (original)
   - Small "DE" badge
   - "Translate" button option

### Scenario 2: Mixed Team Collaboration
1. German manager creates questions in German
2. English consultant answers in English
3. Each sees:
   - UI in their preferred language
   - Content in its original language
   - Language indicators for foreign content
   - Option to translate when needed

## 4. Benefits of This Approach

1. **Authenticity**: Content remains true to author's intent
2. **Simplicity**: No complex translation management
3. **Cost-Effective**: No automatic translation API costs
4. **Flexibility**: Users can work in their preferred language
5. **Transparency**: Clear indication of content language

## 5. Migration Plan

### Phase 1: UI Translation (Immediate)
- [ ] Add translation keys to all forms
- [ ] Complete German translations
- [ ] Add language detection to content creation

### Phase 2: Database Enhancement (Next Sprint)
- [ ] Add content_language columns
- [ ] Update all create/update functions
- [ ] Add language indicators to UI

### Phase 3: Translation Features (Future)
- [ ] Add manual translation interface
- [ ] Implement translation memory
- [ ] Add professional translation workflow

## 6. Best Practices

1. **Always use translation keys for UI text**
2. **Never auto-translate user content without permission**
3. **Store content in its original language**
4. **Provide clear language indicators**
5. **Make translation optional, not automatic**

## 7. FAQ

**Q: What if a German user wants to see everything in German?**
A: They can click "Translate" on individual pieces of content. We don't auto-translate to preserve accuracy.

**Q: How do we handle search across languages?**
A: Search works in any language. German search finds German content, English finds English.

**Q: What about reports that combine content from multiple languages?**
A: Reports show content in original languages with translate options. Headers/labels follow UI language.

**Q: Should we translate form placeholders and help text?**
A: Yes, all UI elements including placeholders, help text, and validation messages should be translated.

## 8. Technical Implementation Checklist

### Immediate Actions Required:

1. **Update ALL Forms** to use translation keys:
   - [ ] QuestionForm
   - [ ] BusinessForm
   - [ ] ProjectForm
   - [ ] OrganizationForm
   - [ ] StrategyForm
   - [ ] ModuleForm

2. **Add Missing Translations** to `/i18n/messages/de.json`:
   - [ ] Form labels
   - [ ] Placeholders
   - [ ] Validation messages
   - [ ] Help text
   - [ ] Success/error messages

3. **Add Language Tracking**:
   - [ ] Update create functions to store content_language
   - [ ] Add language badges to display components
   - [ ] Implement optional translate button

4. **User Locale Detection**:
   - [ ] Get locale from next-intl context
   - [ ] Store user's preferred language in profile
   - [ ] Use for content_language field

This approach ensures a clean, maintainable multilingual system that respects both UI preferences and content authenticity.