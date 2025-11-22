-- Fix function search path security warning
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers after fixing the function
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