"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  FileText,
  Scale,
  WifiOff,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "AI-Powered Bench Cards",
    description:
      "Instant access to formatted reference cards for any hearing type. Populated with relevant statutes, rules, and procedural checklists — ready before you take the bench.",
    size: "large" as const,
    gradient: "from-amber-500/10 to-amber-600/5",
  },
  {
    icon: Search,
    title: "Statute Search & Summaries",
    description:
      "Search all of TCA Title 36 and 37 with AI-generated plain-language summaries. Cross-references detected automatically.",
    size: "small" as const,
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    icon: FileText,
    title: "DCS Policy Search",
    description:
      "Instantly search all DCS policies and procedures by number, keyword, or topic. Know exactly which policy DCS is violating and cite it on the record.",
    size: "small" as const,
    gradient: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    icon: Scale,
    title: "Case Law Integration",
    description:
      "Relevant case citations surfaced automatically alongside statutory text. Never miss a controlling decision.",
    size: "small" as const,
    gradient: "from-purple-500/10 to-purple-600/5",
  },
  {
    icon: WifiOff,
    title: "Offline Mode",
    description:
      "Works without internet — critical for courtrooms with poor connectivity. Your bench cards are always available.",
    size: "small" as const,
    gradient: "from-rose-500/10 to-rose-600/5",
  },
  {
    icon: Globe,
    title: "Multi-Jurisdiction Ready",
    description:
      "Starting with Tennessee, expanding state by state. The same powerful platform, adapted to your jurisdiction's statutes and rules.",
    size: "large" as const,
    gradient: "from-cyan-500/10 to-cyan-600/5",
  },
];

const iconColors: Record<string, string> = {
  BookOpen: "text-amber-400",
  Search: "text-blue-400",
  FileText: "text-emerald-400",
  Scale: "text-purple-400",
  WifiOff: "text-rose-400",
  Globe: "text-cyan-400",
};

export function FeaturesGrid() {
  return (
    <section id="features" className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1220] to-[#0a0e1a]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything the Bench Needs
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A comprehensive judicial toolkit, powered by AI and built on
            authoritative Tennessee legal sources.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-sm hover:border-white/[0.12] transition-all duration-500 ${
                feature.size === "large" ? "lg:col-span-2" : ""
              }`}
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative p-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-white/20 transition-colors">
                  <feature.icon
                    className={`w-5 h-5 ${iconColors[feature.icon.displayName || feature.icon.name] || "text-slate-400"}`}
                  />
                </div>

                <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Corner glow on hover */}
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-white/[0.02] group-hover:bg-white/[0.04] transition-all duration-500 blur-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
