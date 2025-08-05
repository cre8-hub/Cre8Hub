
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create enum types for user roles and content genres
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('content-creator', 'entrepreneur', 'social-media-manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_genre AS ENUM ('educational', 'entertainment', 'gaming', 'lifestyle', 'music', 'tech', 'travel', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_category AS ENUM ('ecommerce', 'saas', 'consulting', 'agency', 'retail', 'manufacturing', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE client_type AS ENUM ('influencers', 'small-businesses', 'corporate', 'individuals', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_size AS ENUM ('solo', 'small-team', 'medium', 'large');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE social_media_niche AS ENUM ('content-creation', 'community-management', 'marketing-campaigns', 'analytics', 'full-service');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    user_role user_role,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_creator_profiles table
CREATE TABLE IF NOT EXISTS content_creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content_genre content_genre NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entrepreneur_profiles table
CREATE TABLE IF NOT EXISTS entrepreneur_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_category business_category NOT NULL,
    business_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_media_manager_profiles table
CREATE TABLE IF NOT EXISTS social_media_manager_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    client_type client_type NOT NULL,
    business_size business_size NOT NULL,
    social_media_niche social_media_niche NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrepreneur_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_manager_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for content_creator_profiles
CREATE POLICY "Users can view their own content creator profile" ON content_creator_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own content creator profile" ON content_creator_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content creator profile" ON content_creator_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for entrepreneur_profiles
CREATE POLICY "Users can view their own entrepreneur profile" ON entrepreneur_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own entrepreneur profile" ON entrepreneur_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entrepreneur profile" ON entrepreneur_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for social_media_manager_profiles
CREATE POLICY "Users can view their own social media manager profile" ON social_media_manager_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own social media manager profile" ON social_media_manager_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social media manager profile" ON social_media_manager_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_creator_profiles_updated_at
    BEFORE UPDATE ON content_creator_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entrepreneur_profiles_updated_at
    BEFORE UPDATE ON entrepreneur_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_manager_profiles_updated_at
    BEFORE UPDATE ON social_media_manager_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
