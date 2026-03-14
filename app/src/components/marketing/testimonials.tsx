"use client";

import { motion } from "framer-motion";
import { Quote, Clock, Search, FileText } from "lucide-react";

const dayInLife = [
  {
    icon: Clock,
    time: "8:15 AM",
    title: "Morning Docket Review",
    without: "45 minutes flipping through statute books and printed rules",
    with: "5 minutes — bench cards auto-generated for each hearing",
    saved: "40 min saved",
  },
  {
    icon: Search,
    time: "10:30 AM",
    title: "Mid-Hearing DCS Accountability Check",
    without: "Recess called, 15 minutes searching for the right DCS policy number",
    with: "30 seconds — type the issue, get the cited policy instantly",
    saved: "14 min saved",
  },
  {
    icon: FileText,
    time: "2:00 PM",
    title: "Permanency Hearing Preparation",
    without: "2 hours cross-referencing reasonable efforts requirements and DCS timelines",
    with: "10 minutes — complete bench card with all statutes and DCS policies",
    saved: "110 min saved",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0d1220] to-[#0a0e1a]" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Single prominent testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Built From the Bench
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Created by a sitting juvenile court judge who got tired of not having
            the right policy number at hand when it mattered most.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-32"
        >
          <div className="relative">
            <div className="absolute -inset-px bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl" />
            <div className="relative bg-[#111827]/80 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-10 md:p-12">
              <Quote className="w-10 h-10 text-amber-500/30 mb-6" />
              <blockquote className="text-xl md:text-2xl font-medium text-slate-200 leading-relaxed mb-8">
                &ldquo;I&apos;ve spent 20 years on the bench. BenchBook.AI is the first
                tool that actually understands what juvenile court judges need
                — instant answers from the sources I trust.&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-[#0a0e1a] font-bold text-sm">
                  ME
                </div>
                <div>
                  <p className="font-semibold text-white">M.O. Eckel III</p>
                  <p className="text-sm text-slate-400">
                    Juvenile Court Judge, Tipton County, TN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Day in the Life */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold tracking-tight mb-4">
            A Day on the Bench
          </h3>
          <p className="text-slate-400 max-w-lg mx-auto">
            See how BenchBook.AI transforms a typical day for a juvenile court
            judge — saving over 2.5 hours of research time.
          </p>
        </motion.div>

        <div className="space-y-6">
          {dayInLife.map((item, i) => (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-[#111827]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 md:w-48 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      {item.time}
                    </p>
                    <p className="font-semibold text-sm">{item.title}</p>
                  </div>
                </div>

                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1">
                      Without BenchBook.AI
                    </p>
                    <p className="text-sm text-slate-400">{item.without}</p>
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">
                      With BenchBook.AI
                    </p>
                    <p className="text-sm text-slate-300">{item.with}</p>
                  </div>
                </div>

                <div className="md:w-24 shrink-0 text-right">
                  <span className="inline-block px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
                    {item.saved}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total saved */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold">
              2+ hours saved every day
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
