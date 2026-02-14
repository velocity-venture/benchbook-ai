"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Palette,
  LogOut,
  Save,
  Check,
  Mail,
  Phone,
  Loader2,
  Monitor,
  Smartphone,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { usePreferences } from "@/contexts/preferences-context";

const tabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "security", name: "Security", icon: Shield },
  { id: "appearance", name: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Profile fields
  const [profile, setProfile] = useState({
    full_name: "",
    title: "",
    county: "",
    email: "",
    phone: "",
    organization: "",
  });

  // Use preferences context
  const { preferences, updatePreferences: updatePrefs } = usePreferences();


  const updateProfile = (field: string, value: string) =>
    setProfile((prev) => ({ ...prev, [field]: value }));


  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        title: data.title || "Judge",
        county: data.county || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        organization: data.organization || "",
      });

    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        title: profile.title,
        county: profile.county,
        email: profile.email,
        phone: profile.phone,
        organization: profile.organization,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-800">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {activeTab === "profile" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-2xl font-bold text-slate-950">
                        {profile.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-white">{profile.full_name || "Set your name"}</p>
                        <p className="text-sm text-slate-400">{profile.title}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Full Name</label>
                        <Input
                          value={profile.full_name}
                          onChange={(e) => updateProfile("full_name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Title</label>
                        <Input
                          value={profile.title}
                          onChange={(e) => updateProfile("title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">County</label>
                        <Input
                          value={profile.county}
                          onChange={(e) => updateProfile("county", e.target.value)}
                          placeholder="e.g., Tipton County"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Organization</label>
                        <Input
                          value={profile.organization}
                          onChange={(e) => updateProfile("organization", e.target.value)}
                          placeholder="e.g., Tipton County Juvenile Court"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>How we can reach you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        Email
                      </label>
                      <Input
                        value={profile.email}
                        onChange={(e) => updateProfile("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        Phone
                      </label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => updateProfile("phone", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={loadProfile}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Current Password</label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">New Password</label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Confirm New Password</label>
                      <Input type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">2FA Status</p>
                          <p className="text-sm text-slate-400">Not yet configured</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "appearance" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Choose your preferred appearance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      {[
                        { name: "Dark", value: "dark" },
                        { name: "Light", value: "light" },
                        { name: "System", value: "system" },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => updatePrefs({ theme: theme.value as any })}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                            preferences.theme === theme.value
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                          )}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-amber-400" />
                      Courtroom Mode
                    </CardTitle>
                    <CardDescription>
                      Optimize the interface for bench use during hearings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main Courtroom Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Enable Courtroom Mode</p>
                          <p className="text-sm text-slate-400">
                            Large fonts, simplified navigation, tablet-optimized
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePrefs({ courtroomMode: !preferences.courtroomMode })}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          preferences.courtroomMode ? "bg-amber-500" : "bg-slate-600"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            preferences.courtroomMode ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>

                    {/* Courtroom Mode Options */}
                    {preferences.courtroomMode && (
                      <div className="space-y-4 pl-4 border-l-2 border-amber-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white text-sm">Large Fonts</p>
                            <p className="text-xs text-slate-400">Increase text size for better readability</p>
                          </div>
                          <button
                            onClick={() => updatePrefs({ largeFonts: !preferences.largeFonts })}
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                              preferences.largeFonts ? "bg-amber-500" : "bg-slate-600"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                                preferences.largeFonts ? "translate-x-5" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white text-sm">Voice-to-Text</p>
                            <p className="text-xs text-slate-400">Enable voice search for hands-free operation</p>
                          </div>
                          <button
                            onClick={() => updatePrefs({ voiceToText: !preferences.voiceToText })}
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                              preferences.voiceToText ? "bg-amber-500" : "bg-slate-600"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                                preferences.voiceToText ? "translate-x-5" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white text-sm">Reduced Motion</p>
                            <p className="text-xs text-slate-400">Minimize animations for distraction-free use</p>
                          </div>
                          <button
                            onClick={() => updatePrefs({ reducedMotion: !preferences.reducedMotion })}
                            className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                              preferences.reducedMotion ? "bg-amber-500" : "bg-slate-600"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                                preferences.reducedMotion ? "translate-x-5" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Volume2 className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-amber-400 font-medium text-sm">Bench Optimization Tips</p>
                          <ul className="text-amber-400/80 text-xs mt-2 space-y-1">
                            <li>• Use voice search during hearings for hands-free research</li>
                            <li>• Large fonts improve readability on tablets from arm's length</li>
                            <li>• Reduced motion minimizes distractions in courtroom settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={loadProfile}>
                    Reset
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
