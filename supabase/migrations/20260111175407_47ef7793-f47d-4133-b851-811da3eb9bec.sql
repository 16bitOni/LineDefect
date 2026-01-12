-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new restricted SELECT policy: users can view their own profile OR managers can view all
CREATE POLICY "Users can view own profile or managers view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'manager'::app_role)
);