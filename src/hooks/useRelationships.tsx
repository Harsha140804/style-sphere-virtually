import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useRelationships() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRelationships();
    }
  }, [user]);

  const fetchRelationships = async () => {
    if (!user) return;

    try {
      // Fetch followers
      const { data: followersData, error: followersError } = await supabase
        .from('user_relationships')
        .select('follower_id, profiles!user_relationships_follower_id_fkey(id, full_name, avatar_url, email)')
        .eq('followed_id', user.id);

      if (followersError) throw followersError;

      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('user_relationships')
        .select('followed_id, profiles!user_relationships_followed_id_fkey(id, full_name, avatar_url, email)')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error) {
      console.error('Error fetching relationships:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_relationships')
        .insert({ follower_id: user.id, followed_id: userId });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You are now following this user',
      });

      fetchRelationships();
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user',
        variant: 'destructive',
      });
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You unfollowed this user',
      });

      fetchRelationships();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfollow user',
        variant: 'destructive',
      });
    }
  };

  const isFollowing = (userId: string) => {
    return following.some((f: any) => f.followed_id === userId);
  };

  const isMutualFollower = (userId: string) => {
    const isFollowingUser = following.some((f: any) => f.followed_id === userId);
    const isFollower = followers.some((f: any) => f.follower_id === userId);
    return isFollowingUser && isFollower;
  };

  return {
    followers,
    following,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    isMutualFollower,
    refreshRelationships: fetchRelationships,
  };
}
