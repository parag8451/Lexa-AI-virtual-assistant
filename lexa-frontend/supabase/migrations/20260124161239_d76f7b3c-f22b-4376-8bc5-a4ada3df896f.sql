-- Create video_generations table for storing generated videos
CREATE TABLE public.video_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  revised_prompt TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  file_path TEXT,
  model TEXT NOT NULL DEFAULT 'gemini-video',
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  duration INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_generations
CREATE POLICY "Users can view their own video generations"
ON public.video_generations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video generations"
ON public.video_generations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video generations"
ON public.video_generations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video generations"
ON public.video_generations FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for generated videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-videos', 'generated-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for generated-videos bucket
CREATE POLICY "Users can view generated videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-videos');

CREATE POLICY "Users can upload their own generated videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own generated videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'generated-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own generated videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-videos' AND auth.uid()::text = (storage.foldername(name))[1]);