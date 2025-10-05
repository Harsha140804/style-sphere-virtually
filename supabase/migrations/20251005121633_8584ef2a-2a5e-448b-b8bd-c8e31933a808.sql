-- Create user relationships table for followers/following
CREATE TABLE public.user_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

-- Enable RLS
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;

-- Policies for user_relationships
CREATE POLICY "Anyone can view relationships"
ON public.user_relationships
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own follow relationships"
ON public.user_relationships
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follow relationships"
ON public.user_relationships
FOR DELETE
USING (auth.uid() = follower_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  related_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create lookbooks table
CREATE TABLE public.lookbooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends-only', 'private')),
  item_ids text[] NOT NULL DEFAULT '{}',
  image text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lookbooks ENABLE ROW LEVEL SECURITY;

-- Policies for lookbooks
CREATE POLICY "Users can view public lookbooks"
ON public.lookbooks
FOR SELECT
USING (visibility = 'public');

CREATE POLICY "Users can view their own lookbooks"
ON public.lookbooks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends-only lookbooks if mutual followers"
ON public.lookbooks
FOR SELECT
USING (
  visibility = 'friends-only' AND
  EXISTS (
    SELECT 1 FROM public.user_relationships ur1
    WHERE ur1.follower_id = auth.uid() AND ur1.followed_id = user_id
  ) AND
  EXISTS (
    SELECT 1 FROM public.user_relationships ur2
    WHERE ur2.follower_id = user_id AND ur2.followed_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own lookbooks"
ON public.lookbooks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lookbooks"
ON public.lookbooks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lookbooks"
ON public.lookbooks
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for lookbooks updated_at
CREATE TRIGGER update_lookbooks_updated_at
  BEFORE UPDATE ON public.lookbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create posts table for social feed
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caption text,
  image_url text,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies for posts
CREATE POLICY "Anyone can view posts"
ON public.posts
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (auth.uid() = user_id);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for post_likes
CREATE POLICY "Anyone can view likes"
ON public.post_likes
FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON public.post_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.post_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create follower notification
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name text;
BEGIN
  -- Get follower's name
  SELECT full_name INTO follower_name
  FROM public.profiles
  WHERE id = NEW.follower_id;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, message, related_user_id)
  VALUES (
    NEW.followed_id,
    'new_follower',
    COALESCE(follower_name, 'Someone') || ' started following you',
    NEW.follower_id
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new follower notifications
CREATE TRIGGER on_new_follower
  AFTER INSERT ON public.user_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_follower();