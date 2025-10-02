-- Create lindy_request_logs table for monitoring Lindy API interactions
-- Groups requests by business_id for debugging and monitoring

CREATE TABLE IF NOT EXISTS lindy_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outgoing', 'incoming')),

  -- Request details
  endpoint TEXT,
  method TEXT DEFAULT 'POST',
  headers JSONB,
  payload JSONB,

  -- Response details (for incoming webhooks)
  response_status INTEGER,
  response_body JSONB,

  -- Metadata
  question_id TEXT, -- e.g., 'Q7'
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  processing_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by business
CREATE INDEX IF NOT EXISTS idx_lindy_request_logs_business_id
  ON lindy_request_logs(business_id);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_lindy_request_logs_created_at
  ON lindy_request_logs(created_at DESC);

-- Composite index for business + direction queries
CREATE INDEX IF NOT EXISTS idx_lindy_request_logs_business_direction
  ON lindy_request_logs(business_id, direction, created_at DESC);

-- Enable RLS
ALTER TABLE lindy_request_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view logs for their own businesses
CREATE POLICY "Users can view their business logs"
  ON lindy_request_logs
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can insert logs
CREATE POLICY "Service role can insert logs"
  ON lindy_request_logs
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE lindy_request_logs IS
  'Logs all Lindy API interactions (outgoing triggers and incoming webhooks) grouped by business_id for monitoring and debugging';

COMMENT ON COLUMN lindy_request_logs.direction IS
  'Direction of request: outgoing (app->Lindy) or incoming (Lindy->app webhook)';

COMMENT ON COLUMN lindy_request_logs.processing_time_ms IS
  'Time taken for Lindy to process and respond (for outgoing requests) or time to process webhook (for incoming)';
