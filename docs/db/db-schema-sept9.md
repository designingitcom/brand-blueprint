-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  activation_type text NOT NULL,
  focus_area text NOT NULL,
  sub_area text,
  status text DEFAULT 'not_started'::text,
  brief jsonb,
  deliverables jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activations_pkey PRIMARY KEY (id),
  CONSTRAINT activations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT activations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.ai_contexts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  tenant_id uuid NOT NULL,
  content_type text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_contexts_pkey PRIMARY KEY (id),
  CONSTRAINT ai_contexts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  question_id uuid,
  user_id uuid,
  tenant_id uuid NOT NULL,
  message_type text NOT NULL,
  content text NOT NULL,
  ai_context jsonb,
  ai_model text,
  ai_tokens_used integer,
  ai_cost numeric,
  parent_message_id uuid,
  conversation_turn integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_conversations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT ai_conversations_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT ai_conversations_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.ai_conversations(id)
);
CREATE TABLE public.analysis_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  tenant_id uuid NOT NULL,
  analysis_type text NOT NULL,
  target_url text,
  workflow_id text,
  status text DEFAULT 'pending'::text,
  results jsonb,
  triggered_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT analysis_results_pkey PRIMARY KEY (id),
  CONSTRAINT analysis_results_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT analysis_results_triggered_by_fkey FOREIGN KEY (triggered_by) REFERENCES auth.users(id)
);
CREATE TABLE public.brand_portal_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  tenant_id uuid NOT NULL,
  section_type text NOT NULL,
  component_type text NOT NULL,
  content jsonb NOT NULL,
  assets jsonb DEFAULT '{}'::jsonb,
  is_completed boolean DEFAULT false,
  last_updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brand_portal_sections_pkey PRIMARY KEY (id),
  CONSTRAINT brand_portal_sections_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT brand_portal_sections_last_updated_by_fkey FOREIGN KEY (last_updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.businesses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  type text DEFAULT 'in_house'::text,
  owner_id uuid,
  tenant_id uuid NOT NULL DEFAULT auth.uid(),
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,
  website text,
  organization_id uuid,
  user_id uuid,
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT businesses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT businesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  name text NOT NULL,
  slug text NOT NULL,
  industry text,
  website text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.deliverables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  format text NOT NULL,
  content jsonb NOT NULL,
  file_url text,
  status text DEFAULT 'draft'::text,
  version integer DEFAULT 1,
  generated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deliverables_pkey PRIMARY KEY (id),
  CONSTRAINT deliverables_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT deliverables_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.invites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer'::text CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'strategist'::text, 'client_owner'::text, 'client_editor'::text, 'viewer'::text])),
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invites_pkey PRIMARY KEY (id),
  CONSTRAINT invites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  user_id uuid,
  role text NOT NULL DEFAULT 'member'::text,
  invited_by uuid,
  invited_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  organization_id uuid,
  CONSTRAINT memberships_pkey PRIMARY KEY (id),
  CONSTRAINT memberships_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT memberships_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id),
  CONSTRAINT memberships_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer DEFAULT 0,
  prerequisites ARRAY DEFAULT '{}'::uuid[],
  is_active boolean DEFAULT true,
  module_type text DEFAULT 'standard'::text,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT modules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  website text,
  industry text,
  company_size text CHECK (company_size = ANY (ARRAY['startup'::text, 'small'::text, 'medium'::text, 'large'::text, 'enterprise'::text])),
  timezone text DEFAULT 'UTC'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  status text DEFAULT 'not_started'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.question_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_question_id uuid,
  target_question_id uuid,
  relationship_type text NOT NULL,
  weight numeric DEFAULT 1.0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT question_relationships_pkey PRIMARY KEY (id),
  CONSTRAINT question_relationships_source_question_id_fkey FOREIGN KEY (source_question_id) REFERENCES public.questions(id),
  CONSTRAINT question_relationships_target_question_id_fkey FOREIGN KEY (target_question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid,
  title text NOT NULL,
  question_type text NOT NULL,
  sort_order integer DEFAULT 0,
  prerequisites ARRAY DEFAULT '{}'::uuid[],
  definition text NOT NULL,
  examples ARRAY DEFAULT '{}'::text[],
  demonstrations jsonb DEFAULT '{}'::jsonb,
  why_it_matters text NOT NULL,
  simple_terms text NOT NULL,
  confidence_calibration_enabled boolean DEFAULT true,
  ai_assistance_enabled boolean DEFAULT true,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  ui_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  question_id uuid,
  tenant_id uuid NOT NULL,
  approved_answer_id uuid,
  status text DEFAULT 'unanswered'::text,
  confidence_score integer CHECK (confidence_score >= 1 AND confidence_score <= 10),
  needs_review boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT responses_pkey PRIMARY KEY (id),
  CONSTRAINT responses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT responses_approved_answer_id_fkey FOREIGN KEY (approved_answer_id) REFERENCES public.user_answers(id)
);
CREATE TABLE public.strategy_paths (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  target_audience text,
  module_sequence ARRAY NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT strategy_paths_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  question_id uuid,
  user_id uuid,
  tenant_id uuid NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  version_number integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_answers_pkey PRIMARY KEY (id),
  CONSTRAINT user_answers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT user_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT user_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  role text NOT NULL DEFAULT 'user'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text,
  email text NOT NULL,
  avatar_url text,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);