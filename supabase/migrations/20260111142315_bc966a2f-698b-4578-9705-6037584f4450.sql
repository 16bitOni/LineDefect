-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('final_inspector', 'group_leader', 'manager');

-- Create zone enum for predefined zones
CREATE TYPE public.zone_type AS ENUM ('L1', 'L2', 'L3', 'L4', 'R0', 'R1', 'R2', 'R3', 'R4');

-- Create defect_status enum
CREATE TYPE public.defect_status AS ENUM ('OPEN', 'CLOSED');

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    zone zone_type,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management (security best practice)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create defects table
CREATE TABLE public.defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT UNIQUE NOT NULL,
    vehicle_frame_no TEXT NOT NULL,
    model_name TEXT NOT NULL,
    defect_category TEXT NOT NULL,
    defect_notes TEXT,
    image_url TEXT,
    targeted_zones zone_type[] NOT NULL,
    status defect_status NOT NULL DEFAULT 'OPEN',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zone_responses table for GL inputs
CREATE TABLE public.zone_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID REFERENCES public.defects(id) ON DELETE CASCADE NOT NULL,
    zone zone_type NOT NULL,
    involved BOOLEAN NOT NULL,
    root_cause TEXT,
    action_taken TEXT,
    manpower_name TEXT,
    manpower_ein TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (defect_id, zone)
);

-- Create manager_analysis table for 4M analysis
CREATE TABLE public.manager_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID REFERENCES public.defects(id) ON DELETE CASCADE NOT NULL UNIQUE,
    machine TEXT,
    method TEXT,
    manpower TEXT,
    material TEXT,
    manager_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_analysis ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to get user's zone
CREATE OR REPLACE FUNCTION public.get_user_zone(_user_id UUID)
RETURNS zone_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT zone FROM public.profiles WHERE user_id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Managers can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'manager'));

-- RLS Policies for defects
CREATE POLICY "All authenticated users can view defects"
ON public.defects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Final inspectors can create defects"
ON public.defects FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'final_inspector'));

CREATE POLICY "Managers can update defect status"
ON public.defects FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'manager'));

-- RLS Policies for zone_responses
CREATE POLICY "All authenticated users can view zone responses"
ON public.zone_responses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Group leaders can create zone responses"
ON public.zone_responses FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'group_leader'));

CREATE POLICY "Group leaders can update their zone responses"
ON public.zone_responses FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'group_leader') AND created_by = auth.uid());

-- RLS Policies for manager_analysis
CREATE POLICY "All authenticated users can view manager analysis"
ON public.manager_analysis FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can create analysis"
ON public.manager_analysis FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update analysis"
ON public.manager_analysis FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'manager'));

-- Create function to generate report ID
CREATE OR REPLACE FUNCTION public.generate_report_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.report_id := 'DEF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    RETURN NEW;
END;
$$;

-- Create trigger for report ID generation
CREATE TRIGGER generate_report_id_trigger
BEFORE INSERT ON public.defects
FOR EACH ROW
EXECUTE FUNCTION public.generate_report_id();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_defects_updated_at
BEFORE UPDATE ON public.defects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zone_responses_updated_at
BEFORE UPDATE ON public.zone_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for defects table
ALTER PUBLICATION supabase_realtime ADD TABLE public.defects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zone_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.manager_analysis;