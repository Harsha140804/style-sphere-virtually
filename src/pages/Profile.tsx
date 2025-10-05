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
import { User, Camera, Bell, Globe, Lock, Trash2, Ruler, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/ColorPicker";
import { BrandSelector } from "@/components/BrandSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg");
  const [profileData, setProfileData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    username: "@sarahj",
    bio: "Fashion enthusiast | Style blogger | Coffee lover ☕",
    measurements: {
      height: "5'6\"",
      bust: "36\"",
      waist: "28\"",
      hips: "38\"",
      shoeSize: "8"
    },
    preferences: {
      style: "Modern Classic",
      colors: ["Black", "White", "Navy", "Blush"],
      brands: ["Zara", "H&M", "Mango"]
    }
  });

  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: true,
    shareData: false,
    emailUpdates: true
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Profile Settings</h1>
          <p className="text-muted-foreground mb-6">Manage your account and style preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

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
                    <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input 
                      id="bio" 
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile}>Save Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input 
                      id="height" 
                      value={profileData.measurements.height}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        measurements: {...profileData.measurements, height: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shoeSize">Shoe Size</Label>
                    <Input 
                      id="shoeSize" 
                      value={profileData.measurements.shoeSize}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        measurements: {...profileData.measurements, shoeSize: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bust">Bust</Label>
                    <Input 
                      id="bust" 
                      value={profileData.measurements.bust}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        measurements: {...profileData.measurements, bust: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist</Label>
                    <Input 
                      id="waist" 
                      value={profileData.measurements.waist}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        measurements: {...profileData.measurements, waist: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hips">Hips</Label>
                    <Input 
                      id="hips" 
                      value={profileData.measurements.hips}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        measurements: {...profileData.measurements, hips: e.target.value}
                      })}
                    />
                  </div>
                </div>

                <div className="p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-medium mb-2">Measurement Tips:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Measure over well-fitting undergarments</li>
                    <li>• Keep the measuring tape snug but not tight</li>
                    <li>• Stand straight with arms at your sides</li>
                    <li>• Take measurements at the fullest/narrowest points</li>
                  </ul>
                </div>

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
                <div className="space-y-2">
                  <Label htmlFor="style">Fashion Style</Label>
                  <Select value={profileData.preferences.style}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Modern Classic">Modern Classic</SelectItem>
                      <SelectItem value="Bohemian">Bohemian</SelectItem>
                      <SelectItem value="Minimalist">Minimalist</SelectItem>
                      <SelectItem value="Streetwear">Streetwear</SelectItem>
                      <SelectItem value="Romantic">Romantic</SelectItem>
                      <SelectItem value="Edgy">Edgy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Favorite Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferences.colors.map((color, index) => (
                      <span key={index} className="px-3 py-1 bg-accent rounded-full text-sm flex items-center gap-2">
                        {color}
                        <button 
                          onClick={() => handleRemoveColor(color)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <ColorPicker onColorSelect={handleAddColor}>
                      <Button variant="outline" size="sm">
                        + Add Color
                      </Button>
                    </ColorPicker>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Brands</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferences.brands.map((brand, index) => (
                      <span key={index} className="px-3 py-1 bg-accent rounded-full text-sm flex items-center gap-2">
                        {brand}
                        <button 
                          onClick={() => handleRemoveBrand(brand)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <BrandSelector onBrandSelect={handleAddBrand}>
                      <Button variant="outline" size="sm">
                        + Add Brand
                      </Button>
                    </BrandSelector>
                  </div>
                </div>

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
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;