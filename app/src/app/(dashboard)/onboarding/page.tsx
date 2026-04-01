"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TN_COUNTIES = [
  "Anderson", "Bedford", "Benton", "Bledsoe", "Blount", "Bradley", "Campbell",
  "Cannon", "Carroll", "Carter", "Cheatham", "Chester", "Claiborne", "Clay",
  "Cocke", "Coffee", "Crockett", "Cumberland", "Davidson", "Decatur",
  "DeKalb", "Dickson", "Dyer", "Fayette", "Fentress", "Franklin", "Gibson",
  "Giles", "Grainger", "Greene", "Grundy", "Hamblen", "Hamilton", "Hancock",
  "Hardeman", "Hardin", "Hawkins", "Haywood", "Henderson", "Henry", "Hickman",
  "Houston", "Humphreys", "Jackson", "Jefferson", "Johnson", "Knox", "Lake",
  "Lauderdale", "Lawrence", "Lewis", "Lincoln", "Loudon", "Macon", "Madison",
  "Marion", "Marshall", "Maury", "McMinn", "McNairy", "Meigs", "Monroe",
  "Montgomery", "Moore", "Morgan", "Obion", "Overton", "Perry", "Pickett",
  "Polk", "Putnam", "Rhea", "Roane", "Robertson", "Rutherford", "Scott",
  "Sequatchie", "Sevier", "Shelby", "Smith", "Stewart", "Sullivan", "Sumner",
  "Tipton", "Trousdale", "Unicoi", "Union", "Van Buren", "Warren",
  "Washington", "Wayne", "Weakley", "White", "Williamson", "Wilson",
];

const COURT_TYPES = ["General Sessions", "Juvenile", "Combined"];
const TITLES = ["Judge", "Magistrate", "Referee"];

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [county, setCounty] = useState("");
  const [courtType, setCourtType] = useState("");
  const [title, setTitle] = useState("Judge");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !county || !courtType) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          county,
          title,
          organization: courtType,
        })
        .eq("id", user.id);

      if (updateError) {
        setError("Failed to save profile. Please try again.");
        console.error("Profile update error:", updateError);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to BenchBook AI
          </h1>
          <p className="text-slate-400">
            Let&apos;s set up your profile so we can tailor your experience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Hon. Jane Smith"
              required
            />
          </div>

          {/* County */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              County <span className="text-red-400">*</span>
            </label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <option value="">Select your county</option>
              {TN_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c} County
                </option>
              ))}
            </select>
          </div>

          {/* Court Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Court Type <span className="text-red-400">*</span>
            </label>
            <select
              value={courtType}
              onChange={(e) => setCourtType(e.target.value)}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <option value="">Select court type</option>
              {COURT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Title
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold"
          >
            {saving ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
