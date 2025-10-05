import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useLookbooks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lookbooks, setLookbooks] = useState<any[]>([]);
  const [myLookbooks, setMyLookbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLookbooks();
      fetchMyLookbooks();
    }
  }, [user]);

  const fetchLookbooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lookbooks')
        .select('*, profiles!lookbooks_user_id_fkey(id, full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLookbooks(data || []);
    } catch (error) {
      console.error('Error fetching lookbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLookbooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lookbooks')
        .select('*, profiles!lookbooks_user_id_fkey(id, full_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyLookbooks(data || []);
    } catch (error) {
      console.error('Error fetching my lookbooks:', error);
    }
  };

  const createLookbook = async (name: string, visibility: string, itemIds: string[], image?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lookbooks')
        .insert({
          user_id: user.id,
          name,
          visibility,
          item_ids: itemIds,
          image,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lookbook created successfully',
      });

      fetchLookbooks();
      fetchMyLookbooks();
      return data;
    } catch (error) {
      console.error('Error creating lookbook:', error);
      toast({
        title: 'Error',
        description: 'Failed to create lookbook',
        variant: 'destructive',
      });
    }
  };

  const updateLookbook = async (lookbookId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('lookbooks')
        .update(updates)
        .eq('id', lookbookId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lookbook updated successfully',
      });

      fetchLookbooks();
      fetchMyLookbooks();
    } catch (error) {
      console.error('Error updating lookbook:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lookbook',
        variant: 'destructive',
      });
    }
  };

  const deleteLookbook = async (lookbookId: string) => {
    try {
      const { error } = await supabase
        .from('lookbooks')
        .delete()
        .eq('id', lookbookId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lookbook deleted successfully',
      });

      fetchLookbooks();
      fetchMyLookbooks();
    } catch (error) {
      console.error('Error deleting lookbook:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lookbook',
        variant: 'destructive',
      });
    }
  };

  return {
    lookbooks,
    myLookbooks,
    loading,
    createLookbook,
    updateLookbook,
    deleteLookbook,
    refreshLookbooks: fetchLookbooks,
  };
}
