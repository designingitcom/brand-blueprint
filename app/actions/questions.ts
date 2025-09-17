'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// No transformation needed - database schema matches UI expectations
function transformDbToUI(dbQuestion: any): Question {
  return {
    ...dbQuestion,
    // The database already has the correct field names
    // Just ensure arrays are arrays and provide defaults if needed
    prerequisites: dbQuestion.prerequisites || [],
    examples: dbQuestion.examples || [],
    demonstrations: dbQuestion.demonstrations || {},
    validation_rules: dbQuestion.validation_rules || {},
    ui_config: dbQuestion.ui_config || {},
  };
}

export type QuestionType = 
  | 'text' 
  | 'longtext' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'rating' 
  | 'select' 
  | 'multiselect' 
  | 'url' 
  | 'file' 
  | 'persona' 
  | 'matrix';

export interface QuestionActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export interface QuestionOption {
  id?: string;
  value: string;
  label: string;
  sort_order: number;
  is_active?: boolean;
}

export interface QuestionDependency {
  id?: string;
  depends_on_question_id: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'gte' | 'lte' | 'exists' | 'not_exists';
  value_json?: any;
}

export interface CreateQuestionData {
  module_id: string;
  code: string;
  label: string;
  help_text?: string;
  type: string;
  required?: boolean;
  sort_order?: number;
  ai_prompt_hint?: string;
  content_language?: string;
  parent_question_id?: string;
  is_master?: boolean;
}

export interface UpdateQuestionData {
  code?: string;
  label?: string;
  help_text?: string;
  type?: string;
  required?: boolean;
  sort_order?: number;
  ai_prompt_hint?: string;
  content_language?: string;
}

export interface Question {
  id: string;
  module_id: string;
  code: string;
  label: string;
  help_text?: string;
  type: string;
  required: boolean;
  sort_order: number;
  ai_prompt_hint?: string;
  created_at: string;
  content_language?: string;
  parent_question_id?: string;
  is_master?: boolean;
  options?: QuestionOption[];
  dependencies?: QuestionDependency[];
  module?: {
    id: string;
    name: string;
    code: string;
  };
  language_versions?: Question[];
}

export async function createQuestion(
  data: CreateQuestionData
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to create a question.' };
    }

    // Verify module exists and user has access
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', data.module_id)
      .single();

    if (moduleError || !module) {
      return { error: 'Module not found or access denied.' };
    }

    // Check if title already exists within the module
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('module_id', data.module_id)
      .eq('title', data.title)
      .single();

    if (existingQuestion) {
      return { error: 'A question with this title already exists in this module.' };
    }

    // Start a transaction by creating the question first
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        module_id: data.module_id,
        title: data.title,
        question_type: data.question_type,
        definition: data.definition || '',
        why_it_matters: data.why_it_matters || '',
        simple_terms: data.simple_terms || '',
        sort_order: data.sort_order || 0,
        prerequisites: data.prerequisites || [],
        examples: data.examples || [],
        demonstrations: data.demonstrations || {},
        confidence_calibration_score: data.confidence_calibration_score || 7,
        confidence_calibration_enabled: data.confidence_calibration_score ? data.confidence_calibration_score > 5 : true,
        ai_assistance_enabled: data.ai_assistance_enabled !== false,
        validation_rules: data.validation_rules || {},
        ui_config: data.ui_config || {},
        content_language: data.content_language || 'en',
        parent_question_id: data.parent_question_id || null,
        is_master: data.is_master !== false,
      })
      .select()
      .single();

    if (questionError) {
      console.error('Database error creating question:', questionError);
      return { error: 'Failed to create question. Please try again.' };
    }

    // Create options if provided for select/multiselect types
    if (data.options && data.options.length > 0 && ['select', 'multiselect'].includes(data.question_type)) {
      const optionsToInsert = data.options.map((option, index) => ({
        question_id: question.id,
        value: option.value,
        label: option.label,
        sort_order: option.sort_order || index,
        is_active: option.is_active !== false,
      }));

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Database error creating options:', optionsError);
        // Don't fail the entire operation, just log the error
      }
    }

    // Create dependencies if provided
    if (data.dependencies && data.dependencies.length > 0) {
      const dependenciesToInsert = data.dependencies.map((dependency) => ({
        question_id: question.id,
        depends_on_question_id: dependency.depends_on_question_id,
        operator: dependency.operator,
        value_json: dependency.value_json,
      }));

      const { error: dependenciesError } = await supabase
        .from('question_dependencies')
        .insert(dependenciesToInsert);

      if (dependenciesError) {
        console.error('Database error creating dependencies:', dependenciesError);
        // Don't fail the entire operation, just log the error
      }
    }

    revalidatePath('/questions');
    revalidatePath(`/modules/${data.module_id}`);
    return { success: true, data: transformDbToUI(question) };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionData
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to update a question.' };
    }

    // Check if question exists - use a simpler query first
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingQuestion) {
      console.error('Question lookup failed:', fetchError, 'ID:', id, 'Existing:', existingQuestion);
      // If simple lookup fails, the question truly doesn't exist or there's a permission issue
      return { error: `Question not found. Error: ${fetchError?.message || 'Unknown error'}` };
    }

    // If title is being updated, check if it already exists in the module
    if (data.title && data.title !== existingQuestion.title) {
      const { data: titleCheck } = await supabase
        .from('questions')
        .select('id')
        .eq('module_id', existingQuestion.module_id)
        .eq('title', data.title)
        .neq('id', id)
        .single();

      if (titleCheck) {
        return { error: 'A question with this title already exists in this module.' };
      }
    }

    // Prepare update data using actual database schema
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.question_type !== undefined) updateData.question_type = data.question_type;
    if (data.definition !== undefined) updateData.definition = data.definition;
    if (data.why_it_matters !== undefined) updateData.why_it_matters = data.why_it_matters;
    if (data.simple_terms !== undefined) updateData.simple_terms = data.simple_terms;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.prerequisites !== undefined) updateData.prerequisites = data.prerequisites;
    if (data.examples !== undefined) updateData.examples = data.examples;
    if (data.demonstrations !== undefined) updateData.demonstrations = data.demonstrations;
    if (data.confidence_calibration_score !== undefined) updateData.confidence_calibration_score = data.confidence_calibration_score;
    if (data.confidence_calibration_enabled !== undefined) updateData.confidence_calibration_enabled = data.confidence_calibration_enabled;
    if (data.ai_assistance_enabled !== undefined) updateData.ai_assistance_enabled = data.ai_assistance_enabled;
    if (data.validation_rules !== undefined) updateData.validation_rules = data.validation_rules;
    if (data.ui_config !== undefined) updateData.ui_config = data.ui_config;
    
    console.log('Update data being sent to database:', updateData);

    // Update the question
    const { data: question, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to update question. Please try again.' };
    }

    // Update options if provided and question_type is select/multiselect
    if (data.options !== undefined && ['select', 'multiselect'].includes(data.question_type || question.question_type)) {
      // Delete existing options
      await supabase
        .from('question_options')
        .delete()
        .eq('question_id', id);

      // Insert new options
      if (data.options.length > 0) {
        const optionsToInsert = data.options.map((option, index) => ({
          question_id: id,
          value: option.value,
          label: option.label,
          sort_order: option.sort_order || index,
          is_active: option.is_active !== false,
        }));

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsToInsert);

        if (optionsError) {
          console.error('Database error updating options:', optionsError);
        }
      }
    }

    // Update dependencies if provided
    if (data.dependencies !== undefined) {
      // Delete existing dependencies
      await supabase
        .from('question_dependencies')
        .delete()
        .eq('question_id', id);

      // Insert new dependencies
      if (data.dependencies.length > 0) {
        const dependenciesToInsert = data.dependencies.map((dependency) => ({
          question_id: id,
          depends_on_question_id: dependency.depends_on_question_id,
          operator: dependency.operator,
          value_json: dependency.value_json,
        }));

        const { error: dependenciesError } = await supabase
          .from('question_dependencies')
          .insert(dependenciesToInsert);

        if (dependenciesError) {
          console.error('Database error updating dependencies:', dependenciesError);
        }
      }
    }

    revalidatePath('/questions');
    revalidatePath(`/modules/${existingQuestion.module_id}`);
    return { success: true, data: transformDbToUI(question) };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteQuestion(
  id: string
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to delete a question.' };
    }

    // Check if question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('id, module_id, code')
      .eq('id', id)
      .single();

    if (fetchError || !existingQuestion) {
      return { error: 'Question not found.' };
    }

    // Check if question has answers (prevent deletion if has answers)
    const { data: answers } = await supabase
      .from('answers')
      .select('id')
      .eq('question_id', id)
      .limit(1);

    if (answers && answers.length > 0) {
      return {
        error:
          'Cannot delete question with existing answers. Please delete all answers first.',
      };
    }

    // Check if question is used in framework bindings
    const { data: bindings } = await supabase
      .from('framework_bindings')
      .select('id')
      .eq('question_id', id)
      .limit(1);

    if (bindings && bindings.length > 0) {
      return {
        error:
          'Cannot delete question that is bound to framework fields. Please remove framework bindings first.',
      };
    }

    // Delete the question (cascade will handle options and dependencies)
    const { error } = await supabase.from('questions').delete().eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to delete question. Please try again.' };
    }

    revalidatePath('/questions');
    revalidatePath(`/modules/${existingQuestion.module_id}`);
    return { success: true };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Get questions with language family information
export async function getQuestionsWithLanguages(
  languageFilter?: string,
  showMasterOnly?: boolean
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('questions')
      .select(`
        *,
        modules:module_id (
          id,
          name,
          slug
        )
      `);

    // Apply filters
    if (languageFilter) {
      query = query.eq('content_language', languageFilter);
    }

    if (showMasterOnly) {
      query = query.eq('is_master', true);
    }

    const { data: questions, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to fetch questions.' };
    }

    // Get language versions for each master question
    const masterQuestionIds = questions?.filter(q => q.is_master).map(q => q.id) || [];
    let languageVersionsMap: { [key: string]: Question[] } = {};

    if (masterQuestionIds.length > 0) {
      const { data: languageVersions } = await supabase
        .from('questions')
        .select(`
          *,
          modules:module_id (
            id,
            name,
            slug
          )
        `)
        .in('parent_question_id', masterQuestionIds)
        .order('content_language');

      if (languageVersions) {
        languageVersionsMap = languageVersions.reduce((acc, version) => {
          const masterId = version.parent_question_id;
          if (!acc[masterId]) {
            acc[masterId] = [];
          }
          acc[masterId].push(transformDbToUI(version));
          return acc;
        }, {} as { [key: string]: Question[] });
      }
    }

    // Get options and dependencies for all questions
    const questionIds = questions?.map(q => q.id) || [];
    let optionsMap: { [key: string]: QuestionOption[] } = {};
    let dependenciesMap: { [key: string]: QuestionDependency[] } = {};

    if (questionIds.length > 0) {
      // Fetch options
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('sort_order', { ascending: true });

      if (options) {
        optionsMap = options.reduce((acc, option) => {
          if (!acc[option.question_id]) {
            acc[option.question_id] = [];
          }
          acc[option.question_id].push(option);
          return acc;
        }, {} as { [key: string]: QuestionOption[] });
      }

      // Fetch dependencies
      const { data: dependencies } = await supabase
        .from('question_dependencies')
        .select('*')
        .in('question_id', questionIds);

      if (dependencies) {
        dependenciesMap = dependencies.reduce((acc, dependency) => {
          if (!acc[dependency.question_id]) {
            acc[dependency.question_id] = [];
          }
          acc[dependency.question_id].push(dependency);
          return acc;
        }, {} as { [key: string]: QuestionDependency[] });
      }
    }

    // Combine questions with their options, dependencies, and language versions
    const questionsWithRelations = questions?.map(question => ({
      ...question,
      module: question.modules,
      options: optionsMap[question.id] || [],
      dependencies: dependenciesMap[question.id] || [],
      language_versions: question.is_master ? languageVersionsMap[question.id] || [] : []
    })) || [];

    const transformedQuestions = questionsWithRelations.map(q => transformDbToUI(q));
    return { success: true, data: transformedQuestions };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getQuestions(): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Get all questions with their modules
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        modules:module_id (
          id,
          name,
          slug
        )
      `)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to fetch questions.' };
    }

    // Get options for all questions
    const questionIds = questions?.map(q => q.id) || [];
    let optionsMap: { [key: string]: QuestionOption[] } = {};
    let dependenciesMap: { [key: string]: QuestionDependency[] } = {};

    if (questionIds.length > 0) {
      // Fetch options
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('sort_order', { ascending: true });

      if (options) {
        optionsMap = options.reduce((acc, option) => {
          if (!acc[option.question_id]) {
            acc[option.question_id] = [];
          }
          acc[option.question_id].push(option);
          return acc;
        }, {} as { [key: string]: QuestionOption[] });
      }

      // Fetch dependencies
      const { data: dependencies } = await supabase
        .from('question_dependencies')
        .select('*')
        .in('question_id', questionIds);

      if (dependencies) {
        dependenciesMap = dependencies.reduce((acc, dependency) => {
          if (!acc[dependency.question_id]) {
            acc[dependency.question_id] = [];
          }
          acc[dependency.question_id].push(dependency);
          return acc;
        }, {} as { [key: string]: QuestionDependency[] });
      }
    }

    // Combine questions with their options and dependencies
    const questionsWithRelations = questions?.map(question => ({
      ...question,
      module: question.modules,
      options: optionsMap[question.id] || [],
      dependencies: dependenciesMap[question.id] || [],
    })) || [];

    const transformedQuestions = questionsWithRelations.map(q => transformDbToUI(q));
    return { success: true, data: transformedQuestions };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getQuestion(id: string): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        *,
        modules:module_id (
          id,
          name,
          slug
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return { error: 'Question not found.' };
    }

    // Get options for this question
    const { data: options } = await supabase
      .from('question_options')
      .select('*')
      .eq('question_id', id)
      .order('sort_order', { ascending: true });

    // Get dependencies for this question
    const { data: dependencies } = await supabase
      .from('question_dependencies')
      .select('*')
      .eq('question_id', id);

    const questionWithRelations = {
      ...question,
      module: question.modules,
      options: options || [],
      dependencies: dependencies || [],
    };

    return { success: true, data: transformDbToUI(questionWithRelations) };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getQuestionsByModule(moduleId: string): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Get questions for specific module
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        modules:module_id (
          id,
          name,
          slug
        )
      `)
      .eq('module_id', moduleId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to fetch questions for module.' };
    }

    // Get options and dependencies for these questions
    const questionIds = questions?.map(q => q.id) || [];
    let optionsMap: { [key: string]: QuestionOption[] } = {};
    let dependenciesMap: { [key: string]: QuestionDependency[] } = {};

    if (questionIds.length > 0) {
      // Fetch options
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .in('question_id', questionIds)
        .order('sort_order', { ascending: true });

      if (options) {
        optionsMap = options.reduce((acc, option) => {
          if (!acc[option.question_id]) {
            acc[option.question_id] = [];
          }
          acc[option.question_id].push(option);
          return acc;
        }, {} as { [key: string]: QuestionOption[] });
      }

      // Fetch dependencies
      const { data: dependencies } = await supabase
        .from('question_dependencies')
        .select('*')
        .in('question_id', questionIds);

      if (dependencies) {
        dependenciesMap = dependencies.reduce((acc, dependency) => {
          if (!acc[dependency.question_id]) {
            acc[dependency.question_id] = [];
          }
          acc[dependency.question_id].push(dependency);
          return acc;
        }, {} as { [key: string]: QuestionDependency[] });
      }
    }

    // Combine questions with their options and dependencies
    const questionsWithRelations = questions?.map(question => ({
      ...question,
      module: question.modules,
      options: optionsMap[question.id] || [],
      dependencies: dependenciesMap[question.id] || [],
    })) || [];

    const transformedQuestions = questionsWithRelations.map(q => transformDbToUI(q));
    return { success: true, data: transformedQuestions };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getQuestionOptions(questionId: string): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    const { data: options, error } = await supabase
      .from('question_options')
      .select('*')
      .eq('question_id', questionId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to fetch question options.' };
    }

    return { success: true, data: options };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getQuestionDependencies(questionId: string): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    const { data: dependencies, error } = await supabase
      .from('question_dependencies')
      .select(`
        *,
        depends_on_question:depends_on_question_id (
          id,
          code,
          label
        )
      `)
      .eq('question_id', questionId);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to fetch question dependencies.' };
    }

    return { success: true, data: dependencies };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Reorder questions within a module
export async function reorderQuestions(questionOrders: { id: string; sort_order: number }[]): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to reorder questions.' };
    }

    // Update each question's sort order
    const updates = questionOrders.map(({ id, sort_order }) =>
      supabase
        .from('questions')
        .update({ sort_order })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    
    // Check if any updates failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      return { error: 'Failed to update some question orders' };
    }

    // Get module_id for revalidation (using the first question)
    if (questionOrders.length > 0) {
      const { data: question } = await supabase
        .from('questions')
        .select('module_id')
        .eq('id', questionOrders[0].id)
        .single();

      if (question?.module_id) {
        revalidatePath(`/modules/${question.module_id}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Duplicate question
// Clone question for translation
export async function cloneQuestionForTranslation(
  masterId: string,
  targetLanguage: string,
  translatedTitle: string,
  translatedDefinition?: string,
  translatedWhyItMatters?: string,
  translatedSimpleTerms?: string
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to clone a question.' };
    }

    // Check if translation already exists
    const { data: existingTranslation } = await supabase
      .from('questions')
      .select('id')
      .eq('parent_question_id', masterId)
      .eq('content_language', targetLanguage)
      .single();

    if (existingTranslation) {
      return { error: `Translation for ${targetLanguage} already exists.` };
    }

    // Use the database function to clone
    const { data, error } = await supabase.rpc('clone_question_for_translation', {
      p_master_id: masterId,
      p_target_language: targetLanguage,
      p_translated_text: translatedTitle,
      p_translated_description: translatedDefinition,
      p_translated_why_it_matters: translatedWhyItMatters,
      p_translated_simple_terms: translatedSimpleTerms,
      p_user_id: user.id
    });

    if (error) {
      console.error('Database error cloning question:', error);
      return { error: 'Failed to clone question for translation.' };
    }

    revalidatePath('/questions');
    return { success: true, data: { id: data, language: targetLanguage } };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function duplicateQuestion(id: string, newCode?: string, newLabel?: string): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to duplicate a question.' };
    }

    // Get the original question with options and dependencies
    const result = await getQuestion(id);
    if (!result.success || !result.data) {
      return { error: 'Question not found.' };
    }

    const originalQuestion = result.data;
    
    // Generate unique title if not provided  
    const duplicateTitle = newLabel || `${originalQuestion.label} (Copy)`;
    
    // Create duplicate question data
    const duplicateData: CreateQuestionData = {
      module_id: originalQuestion.module_id,
      title: duplicateTitle,
      question_type: originalQuestion.type,
      definition: originalQuestion.help_text || '',
      why_it_matters: originalQuestion.ai_prompt_hint || '',
      simple_terms: '',
      sort_order: originalQuestion.sort_order + 1,
      prerequisites: [],
      examples: [],
      demonstrations: {},
      confidence_calibration_score: 7,
      ai_assistance_enabled: true,
      validation_rules: {},
      ui_config: {},
      options: originalQuestion.options?.map(option => ({
        value: option.value,
        label: option.label,
        sort_order: option.sort_order,
        is_active: option.is_active
      })) || []
    };

    return await createQuestion(duplicateData);
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Associate existing questions to a module
export async function associateQuestionsToModule(moduleId: string, questionIds: string[]): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to associate questions.' };
    }

    // Verify module exists
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, name')
      .eq('id', moduleId)
      .single();

    if (moduleError || !module) {
      return { error: 'Module not found.' };
    }

    // Verify all questions exist
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, module_id')
      .in('id', questionIds);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return { error: 'Failed to fetch questions.' };
    }

    if (!questions || questions.length === 0) {
      return { error: 'No valid questions found to associate.' };
    }

    // Filter out questions that are already associated with this module
    const questionsToUpdate = questions.filter(q => q.module_id !== moduleId);
    
    if (questionsToUpdate.length === 0) {
      return { success: true, data: { associatedCount: 0, message: 'All selected questions are already associated with this module.' } };
    }

    // Update only questions that aren't already associated
    const updates = questionsToUpdate.map(question =>
      supabase
        .from('questions')
        .update({ module_id: moduleId })
        .eq('id', question.id)
    );

    const results = await Promise.all(updates);
    
    // Check if any updates failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      return { error: 'Failed to associate some questions to the module.' };
    }

    // Revalidate paths
    revalidatePath('/questions');
    revalidatePath(`/admin/modules/${moduleId}`);
    
    // Also revalidate old module paths for questions that were moved
    const oldModuleIds = [...new Set(questions.map(q => q.module_id).filter(id => id !== moduleId))];
    oldModuleIds.forEach(oldModuleId => {
      revalidatePath(`/admin/modules/${oldModuleId}`);
    });

    return { success: true, data: { associatedCount: questionsToUpdate.length } };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function removeQuestionFromModule(questionId: string): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to remove questions from modules.' };
    }

    // Remove question from module by setting module_id to null
    const { error: updateError } = await supabase
      .from('questions')
      .update({ module_id: null })
      .eq('id', questionId);

    if (updateError) {
      console.error('Error removing question from module:', updateError);
      return { error: 'Failed to remove question from module.' };
    }

    // Revalidate paths to update cache
    revalidatePath('/admin/modules');
    revalidatePath('/admin/questions');

    return { success: true, data: { questionId } };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}