-- Add foreign key constraint between activities and profiles
ALTER TABLE public.activities 
ADD CONSTRAINT activities_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;