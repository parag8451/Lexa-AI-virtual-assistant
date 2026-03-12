-- Make chat-attachments bucket private for defense-in-depth
-- The app already uses signed URLs, so this won't break anything
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-attachments';