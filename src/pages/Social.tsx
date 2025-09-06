import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Plus, Camera, Lock, Globe, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Social = () => {
  const { toast } = useToast();
  const [newPostText, setNewPostText] = useState("");

  const mockPosts = [
    {
      id: 1,
      user: { name: "Sarah J.", avatar: "/placeholder.svg", username: "@sarahj" },
      image: "/placeholder.svg",
      caption: "Perfect outfit for today's meeting! 💼✨ #ootd #professional",
      likes: 24,
      comments: 8,
      isLiked: false,
      timestamp: "2h ago"
    },
    {
      id: 2,
      user: { name: "Emma Wilson", avatar: "/placeholder.svg", username: "@emmaw" },
      image: "/placeholder.svg",
      caption: "Casual Friday vibes 🌟 Which look do you prefer?",
      likes: 156,
      comments: 23,
      isLiked: true,
      timestamp: "4h ago"
    },
    {
      id: 3,
      user: { name: "Alex Chen", avatar: "/placeholder.svg", username: "@alexc" },
      image: "/placeholder.svg",
      caption: "Weekend style inspiration! Loving these colors together 🎨",
      likes: 89,
      comments: 12,
      isLiked: false,
      timestamp: "1d ago"
    }
  ];

  const myLookbooks = [
    { id: 1, name: "Summer Essentials", items: 12, visibility: "public", image: "/placeholder.svg" },
    { id: 2, name: "Work Outfits", items: 8, visibility: "private", image: "/placeholder.svg" },
    { id: 3, name: "Date Night", items: 5, visibility: "friends", image: "/placeholder.svg" },
  ];

  const handleLike = (postId: number) => {
    toast({
      title: "Post Liked",
      description: "You liked this outfit post!"
    });
  };

  const handleShare = (postId: number) => {
    toast({
      title: "Share Options",
      description: "Share to Instagram, Pinterest, or copy link"
    });
  };

  const handleCreatePost = () => {
    if (newPostText.trim()) {
      toast({
        title: "Post Created",
        description: "Your outfit post has been shared!"
      });
      setNewPostText("");
    }
  };

  const handleCreateLookbook = () => {
    toast({
      title: "Create Lookbook",
      description: "Lookbook creator opened"
    });
  };

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
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Share Your Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's your outfit story today?"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            toast({
                              title: "Photo Added",
                              description: `${file.name} ready to post!`
                            });
                          }
                        };
                        input.click();
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Add Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast({
                        title: "Try-On Results",
                        description: "Select from your recent virtual try-on sessions"
                      })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Try-On Result
                    </Button>
                  </div>
                  <Button onClick={handleCreatePost}>Post</Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{post.user.name}</p>
                        <p className="text-sm text-muted-foreground">{post.user.username} • {post.timestamp}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={post.image} 
                        alt="Outfit post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm">{post.caption}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={post.isLiked ? "text-destructive" : ""}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.comments}
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Style Posts</h2>
              <Button onClick={() => toast({
                title: "Create New Post",
                description: "Share your latest outfit or style inspiration!"
              })}>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPosts.slice(0, 2).map((post) => (
                <Card key={post.id} className="hover:shadow-elegant transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt="My outfit post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm mb-2 line-clamp-2">{post.caption}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.likes} likes • {post.comments} comments</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lookbooks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Lookbooks</h2>
              <Button onClick={() => toast({
                title: "Create Lookbook",
                description: "Organize your favorite outfits into a themed collection!"
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Create Lookbook
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLookbooks.map((lookbook) => (
                <Card key={lookbook.id} className="hover:shadow-elegant transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={lookbook.image} 
                        alt={lookbook.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold mb-2">{lookbook.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">{lookbook.items} items</span>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        {lookbook.visibility === "public" && <Globe className="w-3 h-3" />}
                        {lookbook.visibility === "private" && <Lock className="w-3 h-3" />}
                        {lookbook.visibility === "friends" && <Users className="w-3 h-3" />}
                        {lookbook.visibility}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => toast({
                          title: "Edit Lookbook",
                          description: `Editing ${lookbook.name} - add or remove items`
                        })}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => toast({
                          title: "Share Lookbook",
                          description: `Sharing ${lookbook.name} with friends!`
                        })}
                      >
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Social;