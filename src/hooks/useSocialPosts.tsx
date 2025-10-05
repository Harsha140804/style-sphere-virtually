import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useSocialPosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchMyPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      // Fetch posts from followed users and public posts
      const { data: followingData } = await supabase
        .from('user_relationships')
        .select('followed_id')
        .eq('follower_id', user.id);

      const followedIds = followingData?.map(f => f.followed_id) || [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(id, full_name, avatar_url),
          post_likes(id, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter to show posts from followed users and own posts
      const filteredPosts = data?.filter(post => 
        followedIds.includes(post.user_id) || post.user_id === user.id
      ) || [];

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(id, full_name, avatar_url),
          post_likes(id, user_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyPosts(data || []);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    }
  };

  const createPost = async (caption: string, imageUrl?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          caption,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post created successfully',
      });

      fetchPosts();
      fetchMyPosts();
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    }
  };

  const updatePost = async (postId: string, caption: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ caption })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });

      fetchPosts();
      fetchMyPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      fetchPosts();
      fetchMyPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (error) throw error;

      fetchPosts();
      fetchMyPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const unlikePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchPosts();
      fetchMyPosts();
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  const isLiked = (post: any) => {
    return post.post_likes?.some((like: any) => like.user_id === user?.id);
  };

  return {
    posts,
    myPosts,
    loading,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    isLiked,
    refreshPosts: fetchPosts,
  };
}
