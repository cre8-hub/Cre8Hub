
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_role?: 'content-creator' | 'entrepreneur' | 'social-media-manager';
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentCreatorProfile {
  id: string;
  user_id: string;
  content_genre: 'educational' | 'entertainment' | 'gaming' | 'lifestyle' | 'music' | 'tech' | 'travel' | 'other';
  created_at: string;
  updated_at: string;
}

export interface EntrepreneurProfile {
  id: string;
  user_id: string;
  business_category: 'ecommerce' | 'saas' | 'consulting' | 'agency' | 'retail' | 'manufacturing' | 'other';
  business_description: string;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaManagerProfile {
  id: string;
  user_id: string;
  client_type: 'influencers' | 'small-businesses' | 'corporate' | 'individuals' | 'mixed';
  business_size: 'solo' | 'small-team' | 'medium' | 'large';
  social_media_niche: 'content-creation' | 'community-management' | 'marketing-campaigns' | 'analytics' | 'full-service';
  created_at: string;
  updated_at: string;
}
