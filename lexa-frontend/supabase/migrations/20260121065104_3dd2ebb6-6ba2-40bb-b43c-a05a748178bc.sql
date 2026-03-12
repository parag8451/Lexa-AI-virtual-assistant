-- Make chat-attachments bucket private to require signed URLs
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-attachments';