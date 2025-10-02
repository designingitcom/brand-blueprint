-- AI Jobs Queue (for tracking requests)
create table if not exists ai_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  job_type text not null,         -- 'q7_suggestions'
  status text not null default 'queued', -- 'queued' | 'processing' | 'completed' | 'failed'
  payload jsonb,                  -- business basics context
  webhook_url text,               -- Lindy webhook URL to call
  idempotency_key text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI Messages/Results (for storing Lindy responses)
create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  question_id text not null,      -- 'Q7'
  role text not null,             -- 'lindy' or 'user'
  content jsonb not null,         -- full AI response
  variants jsonb,                 -- Q7 suggestions array
  idempotency_key text unique,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists ai_jobs_project_id_idx on ai_jobs(project_id);
create index if not exists ai_jobs_status_idx on ai_jobs(status);
create index if not exists ai_messages_project_id_idx on ai_messages(project_id);
create index if not exists ai_messages_question_id_idx on ai_messages(question_id);

-- RLS policies (adjust based on your auth setup)
alter table ai_jobs enable row level security;
alter table ai_messages enable row level security;

-- Example policies (adjust for your auth)
create policy "Users can view their own jobs" on ai_jobs
  for select using (auth.uid()::text = project_id::text);

create policy "Users can view their own messages" on ai_messages
  for select using (auth.uid()::text = project_id::text);

-- Service role can insert (for webhook endpoint)
create policy "Service role can insert jobs" on ai_jobs
  for insert with check (true);

create policy "Service role can insert messages" on ai_messages
  for insert with check (true);
