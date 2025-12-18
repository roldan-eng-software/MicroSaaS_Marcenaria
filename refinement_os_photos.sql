-- Add photos column to service_orders
ALTER TABLE public.service_orders
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
-- Update RLS for service_orders to ensure user_id is checked (already exists but good to be explicit)
-- The policy already covers manage own service orders based on user_id.
-- Create storage bucket for OS photos if not exists (handled via script or manually in Supabase UI)
-- Usually we just assume the 'photos' bucket exists from previous phases.