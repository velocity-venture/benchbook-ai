"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  FileText,
  HelpCircle,
  LogOut,
  Save,
  Check,
  Mail,
  Phone,
  Building,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "appearance", name: "Appearance", icon: Palette },
  { id: "documents", name: "Document Settings", icon: FileText },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
              <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
                        MO
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          Change Photo
                        </Button>
                        <p className="text-xs text-slate-500 mt-1">JPG, PNG. Max 2MB.</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">First Name</label>
                        <Input defaultValue="M.O." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Last Name</label>
                        <Input defaultValue="Eckel III" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Title</label>
                        <Input defaultValue="Juvenile Court Judge" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Court</label>
                        <Input defaultValue="Tipton County Juvenile Court" />
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
                      <Input defaultValue="judge.eckel@tncourts.gov" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        Phone
                      </label>
                      <Input defaultValue="(901) 555-0123" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-500" />
                        Office Address
                      </label>
                      <Input defaultValue="100 Court Square, Covington, TN 38019" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSave} className="gap-2">
                    {saved ? (
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

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what you want to be notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      title: "Upcoming Hearings",
                      description: "Get reminded about hearings 1 hour before",
                      enabled: true,
                    },
                    {
                      title: "Detention Reviews Due",
                      description: "Alert when a detention review is coming up",
                      enabled: true,
                    },
                    {
                      title: "FERPA Compliance",
                      description: "Reminders about record compliance deadlines",
                      enabled: true,
                    },
                    {
                      title: "New Case Assignments",
                      description: "Notify when new cases are assigned",
                      enabled: false,
                    },
                    {
                      title: "Weekly Digest",
                      description: "Summary of upcoming week's docket",
                      enabled: true,
                    },
                  ].map((notification, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{notification.title}</p>
                        <p className="text-sm text-slate-400">{notification.description}</p>
                      </div>
                      <button
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          notification.enabled ? "bg-amber-500" : "bg-slate-700"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                            notification.enabled ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
                          <p className="font-medium text-white">2FA Enabled</p>
                          <p className="text-sm text-slate-400">Using authenticator app</p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sessions</CardTitle>
                    <CardDescription>Manage your active sessions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { device: "MacBook Pro", location: "Covington, TN", current: true },
                      { device: "iPhone 15", location: "Memphis, TN", current: false },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="font-medium text-white flex items-center gap-2">
                            {session.device}
                            {session.current && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-slate-400">{session.location}</p>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-red-400">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how BenchBook AI looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">Theme</label>
                    <div className="flex gap-3">
                      {[
                        { name: "Dark", value: "dark", active: true },
                        { name: "Light", value: "light", active: false },
                        { name: "System", value: "system", active: false },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                            theme.active
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                          )}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">Sidebar</label>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Collapsed by default</p>
                        <p className="text-sm text-slate-400">Start with sidebar minimized</p>
                      </div>
                      <button className="relative w-11 h-6 rounded-full bg-slate-700">
                        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "documents" && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Settings</CardTitle>
                  <CardDescription>Configure document generation preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Default Signature Line</label>
                    <Input defaultValue="Honorable M.O. Eckel III, Juvenile Court Judge" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Court Name (for headers)</label>
                    <Input defaultValue="JUVENILE COURT FOR TIPTON COUNTY, TENNESSEE" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Default Font</label>
                    <select className="w-full h-10 px-3 rounded-lg border border-slate-700 bg-slate-900 text-sm text-white">
                      <option>Times New Roman</option>
                      <option>Arial</option>
                      <option>Courier New</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Include Court Seal</p>
                      <p className="text-sm text-slate-400">Add seal to generated documents</p>
                    </div>
                    <button className="relative w-11 h-6 rounded-full bg-amber-500">
                      <span className="absolute top-1 w-4 h-4 rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
