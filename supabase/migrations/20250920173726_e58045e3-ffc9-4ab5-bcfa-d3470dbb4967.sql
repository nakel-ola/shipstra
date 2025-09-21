-- Create SSH credentials table
CREATE TABLE public.ssh_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('global', 'project')),
  project_name TEXT,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 22,
  username TEXT NOT NULL,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('password', 'privateKey')),
  password_encrypted TEXT,
  private_key_encrypted TEXT,
  passphrase_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ssh_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own SSH credentials" 
ON public.ssh_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SSH credentials" 
ON public.ssh_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SSH credentials" 
ON public.ssh_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SSH credentials" 
ON public.ssh_credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_ssh_credentials_updated_at
  BEFORE UPDATE ON public.ssh_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_ssh_credentials_user_id ON public.ssh_credentials(user_id);
CREATE INDEX idx_ssh_credentials_type ON public.ssh_credentials(user_id, type);

-- Ensure only one global credential per user using partial unique index
CREATE UNIQUE INDEX idx_ssh_credentials_user_global_unique 
ON public.ssh_credentials(user_id) 
WHERE type = 'global';