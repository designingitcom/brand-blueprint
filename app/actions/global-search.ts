'use server';

import { createClient } from '@/lib/supabase/server';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'strategy' | 'module' | 'question' | 'project' | 'business' | 'organization';
  url: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface GlobalSearchResults {
  strategies: SearchResult[];
  modules: SearchResult[];
  questions: SearchResult[];
  projects: SearchResult[];
  businesses: SearchResult[];
  organizations: SearchResult[];
  total: number;
}

export async function globalSearch(
  query: string,
  locale: string = 'en'
): Promise<GlobalSearchResults> {
  if (!query || query.trim().length < 2) {
    return {
      strategies: [],
      modules: [],
      questions: [],
      projects: [],
      businesses: [],
      organizations: [],
      total: 0,
    };
  }

  const supabase = await createClient();
  const searchTerm = `%${query.trim().toLowerCase()}%`;

  try {
    // Run all queries in PARALLEL for better performance
    const [
      { data: strategies },
      { data: modules },
      { data: questions },
      { data: projects },
      { data: businesses },
      { data: organizations }
    ] = await Promise.all([
      // Search strategies
      supabase
        .from('strategies')
        .select('id, name, slug, description, target_audience')
        .or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm},target_audience.ilike.${searchTerm}`
        )
        .eq('is_active', true)
        .limit(10),

      // Search modules
      supabase
        .from('modules')
        .select('id, name, slug, description, category')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('is_active', true)
        .limit(10),

      // Search questions
      supabase
        .from('questions')
        .select(
          'id, title, question_type, module_id, modules(name, slug), definition, why_it_matters'
        )
        .or(`title.ilike.${searchTerm},definition.ilike.${searchTerm},why_it_matters.ilike.${searchTerm}`)
        .limit(10),

      // Search projects
      supabase
        .from('projects')
        .select('id, name, slug, description, status, businesses(name)')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10),

      // Search businesses
      supabase
        .from('businesses')
        .select('id, name, slug, description, type')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10),

      // Search organizations
      supabase
        .from('organizations')
        .select('id, name, slug, description')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10)
    ]);

    // Transform results with locale-aware URLs
    const strategyResults: SearchResult[] = (strategies || []).map(
      strategy => ({
        id: strategy.id,
        title: strategy.name,
        description: strategy.description || strategy.target_audience,
        type: 'strategy' as const,
        url: `/${locale}/admin/strategies/${strategy.slug || strategy.id}`,
        metadata: { target_audience: strategy.target_audience },
      })
    );

    const moduleResults: SearchResult[] = (modules || []).map(module => ({
      id: module.id,
      title: module.name,
      description: module.description,
      type: 'module' as const,
      url: `/${locale}/admin/modules/${module.slug || module.id}`,
      category: module.category,
    }));

    const questionResults: SearchResult[] = (questions || []).map(question => ({
      id: question.id,
      title: question.title,
      description: question.definition || question.why_it_matters || `${question.question_type} question${question.modules ? ` in ${question.modules.name}` : ''}`,
      type: 'question' as const,
      url: `/${locale}/admin/questions/${question.id}`,
      category: question.question_type,
      metadata: { module: question.modules },
    }));

    const projectResults: SearchResult[] = (projects || []).map(project => ({
      id: project.id,
      title: project.name,
      description:
        project.description ||
        `${project.status} project${project.businesses ? ` for ${project.businesses.name}` : ''}`,
      type: 'project' as const,
      url: `/${locale}/projects/${project.slug || project.id}`,
      metadata: { status: project.status, business: project.businesses },
    }));

    const businessResults: SearchResult[] = (businesses || []).map(
      business => ({
        id: business.id,
        title: business.name,
        description: business.description || business.type,
        type: 'business' as const,
        url: `/${locale}/businesses/${business.slug || business.id}`,
        category: business.type,
      })
    );

    const organizationResults: SearchResult[] = (organizations || []).map(
      org => ({
        id: org.id,
        title: org.name,
        description: org.description || 'Organization',
        type: 'organization' as const,
        url: `/${locale}/organizations/${org.slug || org.id}`,
      })
    );

    const total =
      strategyResults.length +
      moduleResults.length +
      questionResults.length +
      projectResults.length +
      businessResults.length +
      organizationResults.length;

    return {
      strategies: strategyResults,
      modules: moduleResults,
      questions: questionResults,
      projects: projectResults,
      businesses: businessResults,
      organizations: organizationResults,
      total,
    };
  } catch (error) {
    console.error('Global search error:', error);
    return {
      strategies: [],
      modules: [],
      questions: [],
      projects: [],
      businesses: [],
      organizations: [],
      total: 0,
    };
  }
}
