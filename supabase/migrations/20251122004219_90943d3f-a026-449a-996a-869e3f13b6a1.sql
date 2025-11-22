-- Create app_tokens table to store deployed token information
CREATE TABLE IF NOT EXISTS public.app_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_address TEXT NOT NULL,
  total_supply NUMERIC NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 8453,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contract_deployments table to track all contract deployments
CREATE TABLE IF NOT EXISTS public.contract_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_token_id UUID REFERENCES public.app_tokens(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL, -- 'token', 'factory', 'revenue', 'rmx'
  contract_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  deployment_cost NUMERIC,
  network TEXT NOT NULL DEFAULT 'base',
  chain_id INTEGER NOT NULL DEFAULT 8453,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mini_app_configs table to store app configuration
CREATE TABLE IF NOT EXISTS public.mini_app_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_token_id UUID REFERENCES public.app_tokens(id) ON DELETE CASCADE,
  config JSONB NOT NULL, -- Store full token config including tokenomics, revenue share, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mini_app_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_tokens
CREATE POLICY "Users can view their own app tokens"
  ON public.app_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own app tokens"
  ON public.app_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app tokens"
  ON public.app_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for contract_deployments
CREATE POLICY "Users can view their own deployments"
  ON public.contract_deployments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deployments"
  ON public.contract_deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployments"
  ON public.contract_deployments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for mini_app_configs
CREATE POLICY "Users can view their own app configs"
  ON public.mini_app_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own app configs"
  ON public.mini_app_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app configs"
  ON public.mini_app_configs FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_app_tokens_user_id ON public.app_tokens(user_id);
CREATE INDEX idx_app_tokens_token_address ON public.app_tokens(token_address);
CREATE INDEX idx_contract_deployments_user_id ON public.contract_deployments(user_id);
CREATE INDEX idx_contract_deployments_app_token_id ON public.contract_deployments(app_token_id);
CREATE INDEX idx_mini_app_configs_user_id ON public.mini_app_configs(user_id);
CREATE INDEX idx_mini_app_configs_app_token_id ON public.mini_app_configs(app_token_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_app_tokens_updated_at
  BEFORE UPDATE ON public.app_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_deployments_updated_at
  BEFORE UPDATE ON public.contract_deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mini_app_configs_updated_at
  BEFORE UPDATE ON public.mini_app_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();