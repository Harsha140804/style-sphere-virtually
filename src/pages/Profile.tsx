import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Camera, Bell, Globe, Lock, Trash2, Ruler, X, LogOut, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/ColorPicker";
import { BrandSelector } from "@/components/BrandSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useRelationships } from "@/hooks/useRelationships";
import { FollowersDialog } from "@/components/FollowersDialog";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { FollowButton } from "@/components/FollowButton";

const Profile = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { followers, following, followUser, unfollowUser, isFollowing } = useRelationships();
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: true,
    shareData: false,
    emailUpdates: true
  });

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfileData(null);
        setProfileImage("/placeholder.svg");
      } else {
        setProfileData(data);
        setProfileImage(data.avatar_url || "/placeholder.svg");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully."
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved."
    });
  };

  const handleAddColor = (color: string) => {
    if (!profileData.preferences.colors.includes(color)) {
      setProfileData({
        ...profileData,
        preferences: {
          ...profileData.preferences,
          colors: [...profileData.preferences.colors, color]
        }
      });
      toast({
        title: "Color Added",
        description: `${color} has been added to your favorites`
      });
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setProfileData({
      ...profileData,
      preferences: {
        ...profileData.preferences,
        colors: profileData.preferences.colors.filter(color => color !== colorToRemove)
      }
    });
  };

  const handleAddBrand = (brand: string) => {
    if (!profileData.preferences.brands.includes(brand)) {
      setProfileData({
        ...profileData,
        preferences: {
          ...profileData.preferences,
          brands: [...profileData.preferences.brands, brand]
        }
      });
      toast({
        title: "Brand Added",
        description: `${brand} has been added to your preferences`
      });
    }
  };

  const handleRemoveBrand = (brandToRemove: string) => {
    setProfileData({
      ...profileData,
      preferences: {
        ...profileData.preferences,
        brands: profileData.preferences.brands.filter(brand => brand !== brandToRemove)
      }
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "Please confirm account deletion in the email we'll send you."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {isOwnProfile ? "Profile Settings" : `${profileData.full_name || "User"}'s Profile`}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isOwnProfile ? "Manage your account and style preferences" : "View user profile"}
            </p>
          </div>
          {!isOwnProfile && id && (
            <FollowButton
              userId={id}
              isFollowing={isFollowing(id)}
              onFollow={followUser}
              onUnfollow={unfollowUser}
            />
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          {isOwnProfile ? (
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          ) : (
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback>{profileData.full_name?.charAt(0) || profileData.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <div className="space-y-2">
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
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setProfileImage(e.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                            toast({
                              title: "Profile Photo Updated",
                              description: `New profile photo uploaded successfully!`
                            });
                          }
                        };
                        input.click();
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileData.full_name || ''}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      disabled={!isOwnProfile}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email || ''}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isOwnProfile}
                    />
                  </div>
                </div>

                {isOwnProfile && (
                  <Button onClick={handleSaveProfile}>Save Profile</Button>
                )}
              </CardContent>
            </Card>

            {/* Followers/Following Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Social Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setShowFollowersDialog(true)}
                  >
                    <span className="text-2xl font-bold">{followers.length}</span>
                    <span className="text-sm text-muted-foreground">Followers</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setShowFollowingDialog(true)}
                  >
                    <span className="text-2xl font-bold">{following.length}</span>
                    <span className="text-sm text-muted-foreground">Following</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isOwnProfile && (
            <>
              <TabsContent value="measurements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      Body Measurements
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Accurate measurements help us provide better virtual try-on results
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Measurements feature coming soon</p>
                    <Button onClick={handleSaveProfile}>Save Measurements</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Style Preferences</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Help us personalize your fashion recommendations
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">Preferences feature coming soon</p>
                    <Button onClick={handleSaveProfile}>Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications about new features</p>
                  </div>
                  <Switch 
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Updates</p>
                    <p className="text-sm text-muted-foreground">Weekly style tips and trends</p>
                  </div>
                  <Switch 
                    checked={settings.emailUpdates}
                    onCheckedChange={(checked) => setSettings({...settings, emailUpdates: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-sm text-muted-foreground">Allow others to find and follow you</p>
                  </div>
                  <Switch 
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => setSettings({...settings, publicProfile: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share Data for Improvements</p>
                    <p className="text-sm text-muted-foreground">Help us improve our AI algorithms</p>
                  </div>
                  <Switch 
                    checked={settings.shareData}
                    onCheckedChange={(checked) => setSettings({...settings, shareData: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    await signOut();
                    toast({
                      title: "Signed out",
                      description: "You have been successfully signed out"
                    });
                    navigate('/auth');
                  }} 
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground">
                  Account deletion is permanent and cannot be undone.
                </p>
              </CardContent>
            </Card>

            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <Footer />
      
      <FollowersDialog
        open={showFollowersDialog}
        onOpenChange={setShowFollowersDialog}
        title="Followers"
        users={followers}
      />
      
      <FollowersDialog
        open={showFollowingDialog}
        onOpenChange={setShowFollowingDialog}
        title="Following"
        users={following}
      />
    </div>
  );
};

export default Profile;