"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, FileText, Lightbulb, Printer } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search",
    description:
      "Type a legal question in plain English, enter a statute number, or describe a hearing scenario. BenchBook.AI understands judicial context.",
    visual: (
      <div className="bg-[#0d1220] rounded-xl border border-white/10 p-6 font-mono text-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
          <Search className="w-4 h-4 text-slate-500" />
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-300"
          >
            What are the grounds for termination of parental rights?
          </motion.span>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: FileText,
    title: "Review",
    description:
      "BenchBook.AI searches 6,325+ legal provisions and returns a formatted bench card with the exact statutes, rules, and policies that apply.",
    visual: (
      <div className="bg-[#0d1220] rounded-xl border border-white/10 p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              TCA
            </span>
            <span className="text-sm text-slate-400 font-mono">
              § 36-1-113
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-4/5" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="mt-4 space-y-2">
            {[
              "Clear and convincing evidence standard",
              "21 statutory grounds enumerated",
              "Best interest analysis required",
            ].map((point) => (
              <div
                key={point}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Decide",
    description:
      "Read the AI-generated summary with key points highlighted. Every statement is linked back to its source — no hallucinated citations, ever.",
    visual: (
      <div className="bg-[#0d1220] rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-xs uppercase tracking-wider text-slate-500">
            AI Summary
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Parental rights may be terminated upon a finding by{" "}
          <span className="text-amber-400 font-medium">
            clear and convincing evidence
          </span>{" "}
          that grounds exist under{" "}
          <span className="text-blue-400 font-mono text-xs px-1 py-0.5 bg-blue-500/10 rounded">
            T.C.A. § 36-1-113(g)
          </span>{" "}
          and that termination is in the{" "}
          <span className="text-amber-400 font-medium">
            best interest of the child
          </span>
          .
        </p>
      </div>
    ),
  },
  {
    number: "04",
    icon: Printer,
    title: "Act",
    description:
      "Export your bench card as a PDF, print it for the courtroom, or save it to your personal library for instant access during hearings.",
    visual: (
      <div className="bg-[#0d1220] rounded-xl border border-white/10 p-6">
        <div className="flex gap-3">
          {["PDF", "Print", "Save"].map((action) => (
            <div
              key={action}
              className="flex-1 py-3 rounded-lg border border-white/10 text-center text-sm text-slate-400 hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-pointer"
            >
              {action}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">
            ✓
          </div>
          <span className="text-sm text-emerald-400">
            Bench card saved to library
          </span>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section id="how-it-works" ref={containerRef} className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0d1220] to-[#0a0e1a]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From question to answer in seconds. Four simple steps to
            research-backed confidence on the bench.
          </p>
        </motion.div>

        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5 hidden lg:block">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-gradient-to-b from-amber-500 to-amber-500/20"
            />
          </div>

          <div className="space-y-24 lg:space-y-32">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                <div className={`${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-amber-400" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-[#0a0e1a] text-xs font-bold flex items-center justify-center">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className={`${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent rounded-2xl blur-xl" />
                    <div className="relative">{step.visual}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
