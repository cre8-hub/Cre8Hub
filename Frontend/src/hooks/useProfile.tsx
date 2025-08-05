
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface ContentCreatorProfile {
  id: string;
  user_id: string;
  content_genre: 'educational' | 'entertainment' | 'gaming' | 'lifestyle' | 'music' | 'tech' | 'travel' | 'other';
  created_at: string;
  updated_at: string;
}

interface EntrepreneurProfile {
  id: string;
  user_id: string;
  business_category: 'ecommerce' | 'saas' | 'consulting' | 'agency' | 'retail' | 'manufacturing' | 'other';
  business_description: string;
  created_at: string;
  updated_at: string;
}

interface SocialMediaManagerProfile {
  id: string;
  user_id: string;
  client_type: 'influencers' | 'small-businesses' | 'corporate' | 'individuals' | 'mixed';
  business_size: 'solo' | 'small-team' | 'medium' | 'large';
  social_media_niche: 'content-creation' | 'community-management' | 'marketing-campaigns' | 'analytics' | 'full-service';
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const updateUserRole = async (role: 'content-creator' | 'entrepreneur' | 'social-media-manager') => {
    if (!user) return { error: 'No user found' };

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ user_role: role })
        .eq('id', user.id);

      setLoading(false);

      if (error) {
        toast({
          title: "Error updating role",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      await refreshProfile();
      return { error: null };
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error updating role",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: 'An unexpected error occurred' };
    }
  };

  const createContentCreatorProfile = async (contentGenre: ContentCreatorProfile['content_genre']) => {
    if (!user) return { error: 'No user found' };

    setLoading(true);

    try {
      const { error } = await supabase
        .from('content_creator_profiles')
        .insert([{
          user_id: user.id,
          content_genre: contentGenre,
        }]);

      if (!error) {
        await supabase
          .from('user_profiles')
          .update({ profile_completed: true })
          .eq('id', user.id);
      }

      setLoading(false);

      if (error) {
        toast({
          title: "Error creating profile",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      await refreshProfile();
      return { error: null };
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error creating profile",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: 'An unexpected error occurred' };
    }
  };

  const createEntrepreneurProfile = async (
    businessCategory: EntrepreneurProfile['business_category'],
    businessDescription: string
  ) => {
    if (!user) return { error: 'No user found' };

    setLoading(true);

    try {
      const { error } = await supabase
        .from('entrepreneur_profiles')
        .insert([{
          user_id: user.id,
          business_category: businessCategory,
          business_description: businessDescription,
        }]);

      if (!error) {
        await supabase
          .from('user_profiles')
          .update({ profile_completed: true })
          .eq('id', user.id);
      }

      setLoading(false);

      if (error) {
        toast({
          title: "Error creating profile",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      await refreshProfile();
      return { error: null };
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error creating profile",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: 'An unexpected error occurred' };
    }
  };

  const createSocialMediaManagerProfile = async (
    clientType: SocialMediaManagerProfile['client_type'],
    businessSize: SocialMediaManagerProfile['business_size'],
    socialMediaNiche: SocialMediaManagerProfile['social_media_niche']
  ) => {
    if (!user) return { error: 'No user found' };

    setLoading(true);

    try {
      const { error } = await supabase
        .from('social_media_manager_profiles')
        .insert([{
          user_id: user.id,
          client_type: clientType,
          business_size: businessSize,
          social_media_niche: socialMediaNiche,
        }]);

      if (!error) {
        await supabase
          .from('user_profiles')
          .update({ profile_completed: true })
          .eq('id', user.id);
      }

      setLoading(false);

      if (error) {
        toast({
          title: "Error creating profile",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      await refreshProfile();
      return { error: null };
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error creating profile",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: 'An unexpected error occurred' };
    }
  };

  return {
    loading,
    updateUserRole,
    createContentCreatorProfile,
    createEntrepreneurProfile,
    createSocialMediaManagerProfile,
  };
};
