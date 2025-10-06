import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Plus, Camera, Lock, Globe, Users, Edit, Trash2, Loader2, Search, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { useLookbooks } from "@/hooks/useLookbooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useWardrobe } from "@/hooks/useWardrobe";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FollowButton } from "@/components/FollowButton";
import { useRelationships } from "@/hooks/useRelationships";

const Social = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts, myPosts, loading: postsLoading, createPost, updatePost, deletePost, likePost, unlikePost, isLiked } = useSocialPosts();
  const { lookbooks, myLookbooks, loading: lookbooksLoading, createLookbook, updateLookbook, deleteLookbook } = useLookbooks();
  const { wardrobeItems, outfits } = useWardrobe();
  const { followUser, unfollowUser, isFollowing } = useRelationships();
  
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showCreateLookbook, setShowCreateLookbook] = useState(false);
  const [showEditLookbook, setShowEditLookbook] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState<any>(null);
  const [showEditPost, setShowEditPost] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  
  // Lookbook creation state
  const [newLookbook, setNewLookbook] = useState({
    name: "",
    visibility: "public",
    selectedItems: [] as string[],
    selectedOutfits: [] as string[],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadingImage(false);
    }
  };

  const handleCreatePost = async () => {
    if (newPostText.trim() || newPostImage) {
      await createPost(newPostText, newPostImage || undefined);
      setNewPostText("");
      setNewPostImage(null);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .neq('id', user?.id)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleLikeToggle = async (post: any) => {
    if (isLiked(post)) {
      await unlikePost(post.id);
    } else {
      await likePost(post.id);
    }
  };

  const handleSavePost = async () => {
    if (editingPost) {
      await updatePost(editingPost.id, editingPost.caption);
      setShowEditPost(false);
      setEditingPost(null);
    }
  };

  const handleCreateLookbookSubmit = async () => {
    const allItemIds = [...newLookbook.selectedItems];
    
    // Add items from selected outfits
    newLookbook.selectedOutfits.forEach(outfitId => {
      const outfit = outfits.find(o => o.id === outfitId);
      if (outfit) {
        allItemIds.push(...outfit.items);
      }
    });

    if (newLookbook.name.trim() && allItemIds.length > 0) {
      await createLookbook(
        newLookbook.name,
        newLookbook.visibility,
        allItemIds
      );
      setShowCreateLookbook(false);
      setNewLookbook({ name: "", visibility: "public", selectedItems: [], selectedOutfits: [] });
    }
  };

  const handleEditLookbookSubmit = async () => {
    if (editingLookbook) {
      const allItemIds = [...newLookbook.selectedItems];
      
      newLookbook.selectedOutfits.forEach(outfitId => {
        const outfit = outfits.find(o => o.id === outfitId);
        if (outfit) {
          allItemIds.push(...outfit.items);
        }
      });

      await updateLookbook(editingLookbook.id, {
        item_ids: allItemIds,
      });
      setShowEditLookbook(false);
      setEditingLookbook(null);
      setNewLookbook({ name: "", visibility: "public", selectedItems: [], selectedOutfits: [] });
    }
  };

  const handleItemToggle = (itemId: string) => {
    setNewLookbook(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId]
    }));
  };

  const handleOutfitToggle = (outfitId: string) => {
    setNewLookbook(prev => ({
      ...prev,
      selectedOutfits: prev.selectedOutfits.includes(outfitId)
        ? prev.selectedOutfits.filter(id => id !== outfitId)
        : [...prev.selectedOutfits, outfitId]
    }));
  };

  if (postsLoading || lookbooksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Style Social</h1>
          <p className="text-muted-foreground mb-6">Share your style and discover fashion inspiration</p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="pl-10"
            />
            {showSearchResults && searchResults.length > 0 && (
              <Card className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto">
                <CardContent className="p-2">
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        navigate(`/profile/${profile.id}`);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{profile.full_name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="lookbooks">Lookbooks</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Create Post */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Share Your Style</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's your outfit story today?"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
                
                {newPostImage && (
                  <div className="relative">
                    <img src={newPostImage} alt="Upload preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setNewPostImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Photo
                    </Button>
                  </div>
                  <Button onClick={handleCreatePost} disabled={(!newPostText.trim() && !newPostImage) || uploadingImage}>
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No posts yet. Follow users to see their posts!
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/profile/${post.user_id}`)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <Avatar>
                            <AvatarImage src={post.profiles?.avatar_url} />
                            <AvatarFallback>
                              {post.profiles?.full_name?.charAt(0) || post.profiles?.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-semibold">{post.profiles?.full_name || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </button>
                        {post.user_id !== user?.id && (
                          <div className="ml-auto">
                            <FollowButton
                              userId={post.user_id}
                              isFollowing={isFollowing(post.user_id)}
                              onFollow={followUser}
                              onUnfollow={unfollowUser}
                            />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {post.image_url && (
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt="Post"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {post.caption && <p className="text-sm">{post.caption}</p>}
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={isLiked(post) ? "text-destructive" : ""}
                          onClick={() => handleLikeToggle(post)}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isLiked(post) ? "fill-current" : ""}`} />
                          {post.post_likes?.length || 0}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Style Posts</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPosts.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    You haven't created any posts yet
                  </CardContent>
                </Card>
              ) : (
                myPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-elegant transition-shadow duration-300">
                    <CardContent className="p-4">
                      {post.image_url && (
                        <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt="My post"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {post.caption && <p className="text-sm mb-2 line-clamp-2">{post.caption}</p>}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{post.post_likes?.length || 0} likes</span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingPost(post);
                            setShowEditPost(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="lookbooks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Lookbooks</h2>
              <Button onClick={() => setShowCreateLookbook(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Lookbook
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLookbooks.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    You haven't created any lookbooks yet
                  </CardContent>
                </Card>
              ) : (
                myLookbooks.map((lookbook) => (
                  <Card key={lookbook.id} className="hover:shadow-elegant transition-shadow duration-300">
                    <CardContent className="p-4">
                      {lookbook.image && (
                        <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                          <img 
                            src={lookbook.image} 
                            alt={lookbook.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold mb-2">{lookbook.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">
                          {lookbook.item_ids?.length || 0} items
                        </span>
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          {lookbook.visibility === "public" && <Globe className="w-3 h-3" />}
                          {lookbook.visibility === "private" && <Lock className="w-3 h-3" />}
                          {lookbook.visibility === "friends-only" && <Users className="w-3 h-3" />}
                          {lookbook.visibility}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setEditingLookbook(lookbook);
                            setNewLookbook({
                              name: lookbook.name,
                              visibility: lookbook.visibility,
                              selectedItems: lookbook.item_ids || [],
                              selectedOutfits: [],
                            });
                            setShowEditLookbook(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteLookbook(lookbook.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      
      {/* Edit Post Dialog */}
      <Dialog open={showEditPost} onOpenChange={setShowEditPost}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editingPost?.caption || ""}
              onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
              placeholder="Edit your caption..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPost(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePost}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Lookbook Dialog */}
      <Dialog open={showCreateLookbook} onOpenChange={setShowCreateLookbook}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Lookbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lookbook-name">Lookbook Name</Label>
              <Input
                id="lookbook-name"
                value={newLookbook.name}
                onChange={(e) => setNewLookbook({ ...newLookbook, name: e.target.value })}
                placeholder="e.g., Summer Essentials"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={newLookbook.visibility} onValueChange={(value) => setNewLookbook({ ...newLookbook, visibility: value })}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="friends-only">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friends Only
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Private
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items">Wardrobe Items</TabsTrigger>
                <TabsTrigger value="outfits">Saved Outfits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="items" className="space-y-2">
                <Label>Select Items ({newLookbook.selectedItems.length})</Label>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2">
                  {wardrobeItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 p-2 border rounded-lg hover:bg-accent/50">
                      <Checkbox
                        checked={newLookbook.selectedItems.includes(item.id)}
                        onCheckedChange={() => handleItemToggle(item.id)}
                      />
                      <div className="flex-1">
                        <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded mb-1" />
                        <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="outfits" className="space-y-2">
                <Label>Select Outfits ({newLookbook.selectedOutfits.length})</Label>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2">
                  {outfits.map((outfit) => (
                    <div key={outfit.id} className="flex items-start gap-2 p-2 border rounded-lg hover:bg-accent/50">
                      <Checkbox
                        checked={newLookbook.selectedOutfits.includes(outfit.id)}
                        onCheckedChange={() => handleOutfitToggle(outfit.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{outfit.name}</p>
                        <p className="text-xs text-muted-foreground">{outfit.items.length} items</p>
                        <p className="text-xs text-muted-foreground">{outfit.occasion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateLookbook(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLookbookSubmit} 
              disabled={!newLookbook.name.trim() || (newLookbook.selectedItems.length === 0 && newLookbook.selectedOutfits.length === 0)}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lookbook Dialog */}
      <Dialog open={showEditLookbook} onOpenChange={setShowEditLookbook}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lookbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items">Wardrobe Items</TabsTrigger>
                <TabsTrigger value="outfits">Saved Outfits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="items" className="space-y-2">
                <Label>Select Items ({newLookbook.selectedItems.length})</Label>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2">
                  {wardrobeItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 p-2 border rounded-lg hover:bg-accent/50">
                      <Checkbox
                        checked={newLookbook.selectedItems.includes(item.id)}
                        onCheckedChange={() => handleItemToggle(item.id)}
                      />
                      <div className="flex-1">
                        <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded mb-1" />
                        <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="outfits" className="space-y-2">
                <Label>Select Outfits ({newLookbook.selectedOutfits.length})</Label>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2">
                  {outfits.map((outfit) => (
                    <div key={outfit.id} className="flex items-start gap-2 p-2 border rounded-lg hover:bg-accent/50">
                      <Checkbox
                        checked={newLookbook.selectedOutfits.includes(outfit.id)}
                        onCheckedChange={() => handleOutfitToggle(outfit.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{outfit.name}</p>
                        <p className="text-xs text-muted-foreground">{outfit.items.length} items</p>
                        <p className="text-xs text-muted-foreground">{outfit.occasion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLookbook(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLookbookSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Social;
