"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Preferences {
  theme: "dark" | "light" | "system";
  courtroomMode: boolean;
  largeFonts: boolean;
  voiceToText: boolean;
  reducedMotion: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (newPreferences: Partial<Preferences>) => Promise<void>;
  isLoading: boolean;
}

const defaultPreferences: Preferences = {
  theme: "dark",
  courtroomMode: false,
  largeFonts: false,
  voiceToText: false,
  reducedMotion: false,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single();

      if (data?.preferences) {
        setPreferences({ ...defaultPreferences, ...data.preferences });
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<Preferences>) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from("profiles")
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (!error) {
        setPreferences(updatedPreferences);
        
        // Apply preferences to document root for CSS
        applyPreferencesToDOM(updatedPreferences);
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  // Apply preferences to DOM for CSS styling
  useEffect(() => {
    applyPreferencesToDOM(preferences);
  }, [preferences]);

  const applyPreferencesToDOM = (prefs: Preferences) => {
    const root = document.documentElement;
    
    // Apply theme
    root.setAttribute("data-theme", prefs.theme);
    
    // Apply courtroom mode
    if (prefs.courtroomMode) {
      root.classList.add("courtroom-mode");
    } else {
      root.classList.remove("courtroom-mode");
    }
    
    // Apply large fonts
    if (prefs.largeFonts) {
      root.classList.add("large-fonts");
    } else {
      root.classList.remove("large-fonts");
    }
    
    // Apply reduced motion
    if (prefs.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Store voice-to-text preference for other components to access
    if (typeof window !== "undefined") {
      window.__benchbook_voice_enabled = prefs.voiceToText;
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        isLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}

// Global window extension for voice-to-text
declare global {
  interface Window {
    __benchbook_voice_enabled?: boolean;
  }
}