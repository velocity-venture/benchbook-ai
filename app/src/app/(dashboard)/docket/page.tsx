"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  User,
  FileText,
  MapPin,
  Video,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { hearingTypeDisplay } from "@/lib/db";

interface Hearing {
  id: string;
  time: string;
  duration: number;
  caseNumber: string;
  type: string;
  child: string;
  attorney: string;
  room: string;
  virtual: boolean;
}

const hearingTypeColors: Record<string, string> = {
  Preliminary: "bg-blue-600",
  "Detention Review": "bg-red-600",
  Adjudicatory: "bg-purple-600",
  Disposition: "bg-green-600",
  Review: "bg-yellow-600",
  "Transfer Hearing": "bg-orange-600",
};

export default function DocketPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");
  const [hearingsData, setHearingsData] = useState<Record<string, Hearing[]>>({});
  const [loading, setLoading] = useState(true);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    for (let i = 0; i < 5; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const fetchHearings = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch hearings for the visible week
    const monday = new Date(currentDate);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const { data, error } = await supabase
      .from("hearings")
      .select("id, case_number, hearing_type, hearing_date, start_time, duration_minutes, child_initials, attorney, room, is_virtual")
      .gte("hearing_date", formatDate(monday))
      .lte("hearing_date", formatDate(friday))
      .order("start_time", { ascending: true });

    if (!error && data) {
      const grouped: Record<string, Hearing[]> = {};
      for (const row of data) {
        const dateKey = row.hearing_date;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({
          id: row.id,
          time: row.start_time?.substring(0, 5) || "",
          duration: row.duration_minutes || 30,
          caseNumber: row.case_number,
          type: hearingTypeDisplay[row.hearing_type] || row.hearing_type,
          child: row.child_initials || "",
          attorney: row.attorney || "",
          room: row.room || "Courtroom A",
          virtual: row.is_virtual || false,
        });
      }
      setHearingsData(grouped);
    }
    setLoading(false);
  }, [currentDate]);

  useEffect(() => {
    fetchHearings();
  }, [fetchHearings]);

  const todayKey = formatDate(currentDate);
  const todayHearings = hearingsData[todayKey] || [];

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + direction);
    } else {
      newDate.setDate(newDate.getDate() + direction * 7);
    }
    setCurrentDate(newDate);
  };

  // Compute weekly summary from fetched data
  const weeklySummary: Record<string, number> = {};
  for (const hearings of Object.values(hearingsData)) {
    for (const h of hearings) {
      weeklySummary[h.type] = (weeklySummary[h.type] || 0) + 1;
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Docket</h1>
          <p className="text-slate-400">Your court calendar and scheduled hearings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Hearing
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
              >
                Day
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
              >
                Week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : view === "day" ? (
        /* Day View */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-amber-400" />
                  {todayHearings.length} Hearings Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {todayHearings.length > 0 ? (
                  <div className="divide-y divide-slate-800">
                    {todayHearings.map((hearing) => (
                      <div
                        key={hearing.id}
                        className="p-4 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 text-center">
                            <p className="text-lg font-bold text-white">{hearing.time}</p>
                            <p className="text-xs text-slate-500">{hearing.duration} min</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    className={cn(
                                      "text-white text-xs",
                                      hearingTypeColors[hearing.type] || "bg-slate-600"
                                    )}
                                  >
                                    {hearing.type}
                                  </Badge>
                                  {hearing.virtual && (
                                    <Badge variant="outline" className="gap-1 text-xs">
                                      <Video className="w-3 h-3" />
                                      Virtual
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium text-white">{hearing.caseNumber}</p>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-slate-400">
                                <User className="w-4 h-4" />
                                <span>{hearing.child}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400">
                                <FileText className="w-4 h-4" />
                                <span>{hearing.attorney}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 col-span-2">
                                <MapPin className="w-4 h-4" />
                                <span>{hearing.room}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button variant="outline" size="sm">
                              View Case
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No hearings scheduled for this day</p>
                    <Button variant="outline" className="mt-4">
                      Schedule a Hearing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mini Calendar & Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weekDates.map((date) => {
                    const dateKey = formatDate(date);
                    const dayHearings = hearingsData[dateKey] || [];
                    const isSelected = dateKey === todayKey;
                    const isToday = formatDate(new Date()) === dateKey;

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setCurrentDate(date)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                          isSelected
                            ? "bg-amber-500/10 border border-amber-500/30"
                            : "hover:bg-slate-800"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium",
                              isToday ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-white"
                            )}
                          >
                            {date.getDate()}
                          </div>
                          <span className="text-sm text-slate-400">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {dayHearings.length} hearings
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(weeklySummary).length > 0 ? (
                    Object.entries(weeklySummary).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              hearingTypeColors[type] || "bg-slate-600"
                            )}
                          />
                          <span className="text-sm text-slate-400">{type}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center">No hearings this week</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Week View */
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-4">
              {weekDates.map((date) => {
                const dateKey = formatDate(date);
                const dayHearings = hearingsData[dateKey] || [];
                const isToday = formatDate(new Date()) === dateKey;

                return (
                  <div key={dateKey} className="space-y-2">
                    <div
                      className={cn(
                        "text-center p-2 rounded-lg",
                        isToday && "bg-amber-500/10 border border-amber-500/30"
                      )}
                    >
                      <p className="text-xs text-slate-500">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isToday ? "text-amber-400" : "text-white"
                        )}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                    <div className="space-y-1 min-h-[200px]">
                      {dayHearings.map((hearing) => (
                        <div
                          key={hearing.id}
                          className={cn(
                            "p-2 rounded text-xs",
                            hearingTypeColors[hearing.type] || "bg-slate-700"
                          )}
                        >
                          <p className="font-medium text-white">{hearing.time}</p>
                          <p className="text-white/80 truncate">{hearing.caseNumber}</p>
                          <p className="text-white/60 truncate">{hearing.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
