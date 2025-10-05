import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Plus, Camera, Lock, Globe, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
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

const Social = () => {
  const { user } = useAuth();
  const { posts, myPosts, loading: postsLoading, createPost, updatePost, deletePost, likePost, unlikePost, isLiked } = useSocialPosts();
  const { lookbooks, myLookbooks, loading: lookbooksLoading, createLookbook, updateLookbook, deleteLookbook } = useLookbooks();
  const { wardrobeItems } = useWardrobe();
  
  const [newPostText, setNewPostText] = useState("");
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
  });

  const handleCreatePost = async () => {
    if (newPostText.trim()) {
      await createPost(newPostText);
      setNewPostText("");
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
    if (newLookbook.name.trim() && newLookbook.selectedItems.length > 0) {
      await createLookbook(
        newLookbook.name,
        newLookbook.visibility,
        newLookbook.selectedItems
      );
      setShowCreateLookbook(false);
      setNewLookbook({ name: "", visibility: "public", selectedItems: [] });
    }
  };

  const handleEditLookbookSubmit = async () => {
    if (editingLookbook) {
      await updateLookbook(editingLookbook.id, {
        item_ids: newLookbook.selectedItems,
      });
      setShowEditLookbook(false);
      setEditingLookbook(null);
      setNewLookbook({ name: "", visibility: "public", selectedItems: [] });
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
                <div className="flex justify-end">
                  <Button onClick={handleCreatePost} disabled={!newPostText.trim()}>
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
                        <Avatar>
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback>
                            {post.profiles?.full_name?.charAt(0) || post.profiles?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{post.profiles?.full_name || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </p>
                        </div>
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
            <div className="space-y-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateLookbook(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLookbookSubmit} disabled={!newLookbook.name.trim() || newLookbook.selectedItems.length === 0}>
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
            <div className="space-y-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
