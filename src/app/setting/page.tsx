"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // User data
  const [userId, setUserId] = useState<string | null>(null);

  // Theme settings
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium"
  );

  // Notification settings
  const [newMessages, setNewMessages] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Privacy settings
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);

  // Language settings
  const [language, setLanguage] = useState("en");

  // Keyboard shortcuts
  const [shortcuts, setShortcuts] = useState({
    newMessage: "Ctrl+N",
    search: "Ctrl+K",
    markAsRead: "Ctrl+R",
    sendMessage: "Enter",
    editMessage: "E",
    deleteMessage: "Delete",
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.uid);

    // Here you would fetch user preferences from Firestore
    // For now, we'll use default values
    const fetchUserPreferences = async () => {
      try {
        // This would be replaced with actual Firestore call
        // const userProfile = await getUserProfile(user.uid);
        // if (userProfile && userProfile.preferences) {
        //   const prefs = userProfile.preferences;
        //   setTheme(prefs.theme);
        //   setFontSize(prefs.fontSize);
        //   setNewMessages(prefs.notifications.newMessages);
        //   setMentions(prefs.notifications.mentions);
        //   setSystemUpdates(prefs.notifications.systemUpdates);
        //   setEmailNotifications(prefs.notifications.email);
        //   setShowOnlineStatus(prefs.privacy.showOnlineStatus);
        //   setShowReadReceipts(prefs.privacy.showReadReceipts);
        //   setAllowDirectMessages(prefs.privacy.allowDirectMessages);
        //   setLanguage(prefs.language);
        //   setShortcuts(prefs.keyboardShortcuts);
        // }

        // Simulate loading delay
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load your preferences. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, [router, toast]);

  const handleSaveSettings = async () => {
    if (!userId) return;

    setIsSaving(true);

    try {
      // This would be replaced with actual Firestore call
      // await updateUserPreferences(userId, {
      //   theme,
      //   fontSize,
      //   notifications: {
      //     newMessages,
      //     mentions,
      //     systemUpdates,
      //     email: emailNotifications
      //   },
      //   privacy: {
      //     showOnlineStatus,
      //     showReadReceipts,
      //     allowDirectMessages
      //   },
      //   language,
      //   keyboardShortcuts: shortcuts
      // });

      // Simulate saving delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!userId) return;

    try {
      // This would be replaced with actual Firestore call
      // const userData = await exportUserData(userId);
      // const dataStr = JSON.stringify(userData, null, 2);
      // const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      // Create a download link and trigger it
      // const exportFileDefaultName = `synduct-data-${new Date().toISOString()}.json`;
      // const linkElement = document.createElement('a');
      // linkElement.setAttribute('href', dataUri);
      // linkElement.setAttribute('download', exportFileDefaultName);
      // linkElement.click();

      toast({
        title: "Data export successful",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;

    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        // This would be replaced with actual Firebase calls
        // await deleteUserData(userId);
        // await auth.currentUser.delete();

        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully.",
        });

        router.push("/login");
      } catch (error) {
        console.error("Error deleting account:", error);
        toast({
          title: "Deletion failed",
          description: "Failed to delete your account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const updateShortcut = (key: string, value: string) => {
    setShortcuts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Customize your experience with Synduct Chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              {/* <TabsTrigger value="language">Language</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger> */}
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-full h-24 rounded-md border-2 bg-white ${
                        theme === "light" ? "border-primary" : "border-muted"
                      }`}
                      onClick={() => setTheme("light")}></div>
                    <Label>Light</Label>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-full h-24 rounded-md border-2 bg-slate-900 ${
                        theme === "dark" ? "border-primary" : "border-muted"
                      }`}
                      onClick={() => setTheme("dark")}></div>
                    <Label>Dark</Label>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-full h-24 rounded-md border-2 bg-gradient-to-r from-white to-slate-900 ${
                        theme === "system" ? "border-primary" : "border-muted"
                      }`}
                      onClick={() => setTheme("system")}></div>
                    <Label>System</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Font Size</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                  <Select
                    value={fontSize}
                    onValueChange={(value) => setFontSize(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="pt-4">
                    <p
                      className={`${
                        fontSize === "small"
                          ? "text-sm"
                          : fontSize === "medium"
                          ? "text-base"
                          : "text-lg"
                      }`}>
                      This is how your text will appear.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-messages">New Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages
                      </p>
                    </div>
                    <Switch
                      id="new-messages"
                      checked={newMessages}
                      onCheckedChange={setNewMessages}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="mentions">Mentions</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when you are mentioned
                      </p>
                    </div>
                    <Switch
                      id="mentions"
                      checked={mentions}
                      onCheckedChange={setMentions}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system-updates">System Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about system updates
                      </p>
                    </div>
                    <Switch
                      id="system-updates"
                      checked={systemUpdates}
                      onCheckedChange={setSystemUpdates}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="online-status">Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see when you're online
                      </p>
                    </div>
                    <Switch
                      id="online-status"
                      checked={showOnlineStatus}
                      onCheckedChange={setShowOnlineStatus}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="read-receipts">Show Read Receipts</Label>
                      <p className="text-sm text-muted-foreground">
                        Let others know when you've read their messages
                      </p>
                    </div>
                    <Switch
                      id="read-receipts"
                      checked={showReadReceipts}
                      onCheckedChange={setShowReadReceipts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="direct-messages">
                        Allow Direct Messages
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to send you direct messages
                      </p>
                    </div>
                    <Switch
                      id="direct-messages"
                      checked={allowDirectMessages}
                      onCheckedChange={setAllowDirectMessages}
                    />
                  </div>

                  {/* <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profile-visibility">
                        Profile Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile
                      </p>
                    </div>
                    <Select
                      value={profileVisibility}
                      onValueChange={(value) =>
                        setProfileVisibility(value as "public" | "private")
                      }>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}
