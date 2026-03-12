-- Improve handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  safe_name TEXT;
BEGIN
  -- Sanitize and limit display name length
  safe_name := COALESCE(
    SUBSTRING(TRIM(NEW.raw_user_meta_data->>'full_name'), 1, 100),
    SUBSTRING(TRIM(NEW.email), 1, 100)
  );
  
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, safe_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;