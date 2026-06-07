"use client";

import React, { useState } from "react";
import { format, differenceInCalendarDays, subDays } from "date-fns";
import { Trophy, Flame, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { cn } from "@acme/ui";
import { api } from "~/trpc/react";

interface AchievementsClientProps {
  userId: string;
}

// Custom Hexagon/Shield SVG badges based on Quizlet styles
const ShieldBadge = ({ 
  value, 
  label, 
  date, 
  color = "blue", 
  isEarned = false 
}: { 
  value: string | number; 
  label: string; 
  date?: string; 
  color?: "blue" | "purple" | "orange" | "green"; 
  isEarned?: boolean;
}) => {
  const colorClasses = {
    blue: "text-blue-500 fill-blue-500/10 stroke-blue-500 border-blue-500/20",
    purple: "text-purple-500 fill-purple-500/10 stroke-purple-500 border-purple-500/20",
    orange: "text-orange-500 fill-orange-500/10 stroke-orange-500 border-orange-500/20",
    green: "text-emerald-500 fill-emerald-500/10 stroke-emerald-500 border-emerald-500/20",
  };

  return (
    <div className={cn(
      "flex flex-col items-center text-center p-3 transition-opacity duration-300 select-none",
      isEarned ? "opacity-100" : "opacity-35 grayscale"
    )}>
      {/* Shield Graphic */}
      <div className={cn(
        "relative w-20 h-24 flex items-center justify-center shrink-0 mb-3",
        isEarned ? colorClasses[color] : "text-muted-foreground fill-muted/10 stroke-muted-foreground"
      )}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M50 5 L90 20 L90 70 C90 95 70 112 50 117 C30 117 10 95 10 70 L10 20 Z" 
            fill="currentColor" 
            fillOpacity="0.08" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M50 12 L82 24 L82 68 C82 88 66 102 50 106 C34 102 18 88 18 68 L18 24 Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeDasharray="4 3" 
            strokeOpacity="0.4"
          />
        </svg>
        <span className={cn(
          "font-black text-lg tracking-tight z-10 select-none",
          isEarned ? "text-foreground" : "text-muted-foreground"
        )}>
          {value}
        </span>
      </div>

      <span className="font-extrabold text-xs text-foreground leading-tight line-clamp-2 max-w-[110px]">
        {label}
      </span>
      {isEarned && date && (
        <span className="text-[10px] text-muted-foreground font-semibold mt-1">
          {date}
        </span>
      )}
    </div>
  );
};

const AchievementsClient = ({ userId }: AchievementsClientProps) => {
  const [activities] = api.activity.allByUser.useSuspenseQuery();
  const [studySets] = api.studySet.allByUser.useSuspenseQuery({ userId });

  // 1. Toggle limits states for expansion
  const [limitStreaks, setLimitStreaks] = useState(6);
  const [limitWeekly, setLimitWeekly] = useState(6);
  const [limitStudySets, setLimitStudySets] = useState(6);
  const [limitRounds, setLimitRounds] = useState(12);

  // Calculate stats from real DB activity
  const totalRounds = activities.length;
  const totalSetsCount = studySets.length;

  // Simple streak calculation logic
  const calculateStreak = () => {
    if (activities.length === 0) return 0;
    
    // Extract calendar dates formatted as yyyy-MM-dd and remove duplicates
    const dates = Array.from(
      new Set(activities.map(a => format(new Date(a.date), "yyyy-MM-dd")))
    ).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

    let streak = 0;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");

    // Check if user learned today or yesterday to continue streak
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let checkDate = new Date(dates[0]!);
    streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const diff = differenceInCalendarDays(checkDate, new Date(dates[i]!));
      if (diff === 1) {
        streak++;
        checkDate = new Date(dates[i]!);
      } else if (diff > 1) {
        break; // Streak broken
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Helper date for achievements mock date
  const getMockDate = (offsetDays: number) => {
    return format(subDays(new Date(), offsetDays), "d 'tháng' M, yyyy");
  };

  // Define badges configs
  const studyBadges = [
    { value: "✏️", label: "Tập sự thẻ ghi nhớ", color: "blue", isEarned: totalRounds >= 1, date: getMockDate(4) },
    { value: "📚", label: "Học viên tích cực", color: "blue", isEarned: totalRounds >= 3, date: getMockDate(3) },
    { value: "🎯", label: "Cam kết học tập", color: "blue", isEarned: totalRounds >= 5, date: getMockDate(2) },
    { value: "🧩", label: "Tập sự ghép thẻ", color: "blue", isEarned: totalRounds >= 8, date: getMockDate(1) },
    { value: "🦉", label: "Cú đêm thức khuya", color: "purple", isEarned: totalRounds >= 2, date: getMockDate(5) },
    { value: "🐦", label: "Chim sâu dậy sớm", color: "orange", isEarned: totalRounds >= 4, date: getMockDate(3) },
    { value: "📝", label: "Tập sự kiểm tra", color: "purple", isEarned: totalRounds >= 6, date: getMockDate(2) },
    { value: "🛠️", label: "Nhà tạo học phần", color: "orange", isEarned: totalSetsCount >= 1, date: getMockDate(4) },
    { value: "🤝", label: "Người ghép đôi", color: "purple", isEarned: totalRounds >= 12, date: getMockDate(1) },
    { value: "🎓", label: "Sẵn sàng cho kỳ thi", color: "green", isEarned: totalRounds >= 15, date: getMockDate(1) },
  ];

  const dailyStreakBadges = [
    { value: "3d", label: "Chuỗi 3 ngày", isEarned: currentStreak >= 3, date: getMockDate(2) },
    { value: "5d", label: "Chuỗi 5 ngày", isEarned: currentStreak >= 5, date: getMockDate(1) },
    { value: "7d", label: "Chuỗi 7 ngày", isEarned: currentStreak >= 7 },
    { value: "10d", label: "Chuỗi 10 ngày", isEarned: currentStreak >= 10 },
    { value: "20d", label: "Chuỗi 20 ngày", isEarned: currentStreak >= 20 },
    { value: "30d", label: "Chuỗi 30 ngày", isEarned: currentStreak >= 30 },
    { value: "45d", label: "Chuỗi 45 ngày", isEarned: currentStreak >= 45 },
    { value: "60d", label: "Chuỗi 60 ngày", isEarned: currentStreak >= 60 },
    { value: "70d", label: "Chuỗi 70 ngày", isEarned: currentStreak >= 70 },
    { value: "80d", label: "Chuỗi 80 ngày", isEarned: currentStreak >= 80 },
  ];

  const weeklyStreakBadges = [
    { value: "3w", label: "Chuỗi 3 tuần", isEarned: totalRounds >= 10, date: getMockDate(14) },
    { value: "5w", label: "Chuỗi 5 tuần", isEarned: totalRounds >= 20 },
    { value: "10w", label: "Chuỗi 10 tuần", isEarned: totalRounds >= 40 },
    { value: "20w", label: "Chuỗi 20 tuần", isEarned: totalRounds >= 80 },
    { value: "30w", label: "Chuỗi 30 tuần", isEarned: totalRounds >= 120 },
    { value: "40w", label: "Chuỗi 40 tuần", isEarned: totalRounds >= 160 },
    { value: "52w", label: "Chuỗi 52 tuần", isEarned: totalRounds >= 200 },
    { value: "60w", label: "Chuỗi 60 tuần", isEarned: totalRounds >= 240 },
    { value: "70w", label: "Chuỗi 70 tuần", isEarned: totalRounds >= 280 },
    { value: "80w", label: "Chuỗi 80 tuần", isEarned: totalRounds >= 320 },
    { value: "90w", label: "Chuỗi 90 tuần", isEarned: totalRounds >= 360 },
    { value: "104w", label: "Chuỗi 104 tuần", isEarned: totalRounds >= 400 },
    { value: "125w", label: "Chuỗi 125 tuần", isEarned: totalRounds >= 500 },
    { value: "156w", label: "Chuỗi 156 tuần", isEarned: totalRounds >= 600 },
    { value: "175w", label: "Chuỗi 175 tuần", isEarned: totalRounds >= 700 },
    { value: "204w", label: "Chuỗi 204 tuần", isEarned: totalRounds >= 800 },
  ];

  const studySetsBadges = [
    { value: "1", label: "Lần đầu vào học", isEarned: totalSetsCount >= 1, date: getMockDate(20) },
    { value: "3", label: "3 học phần đã học", isEarned: totalSetsCount >= 3, date: getMockDate(15) },
    { value: "5", label: "5 học phần đã học", isEarned: totalSetsCount >= 5, date: getMockDate(10) },
    { value: "10", label: "10 học phần đã học", isEarned: totalSetsCount >= 10, date: getMockDate(5) },
    { value: "25", label: "25 học phần đã học", isEarned: totalSetsCount >= 25 },
    { value: "50", label: "50 học phần đã học", isEarned: totalSetsCount >= 50 },
    { value: "75", label: "75 học phần đã học", isEarned: totalSetsCount >= 75 },
    { value: "100", label: "100 học phần đã học", isEarned: totalSetsCount >= 100 },
    { value: "150", label: "150 học phần đã học", isEarned: totalSetsCount >= 150 },
    { value: "200", label: "200 học phần đã học", isEarned: totalSetsCount >= 200 },
    { value: "250", label: "250 học phần đã học", isEarned: totalSetsCount >= 250 },
    { value: "300", label: "300 học phần đã học", isEarned: totalSetsCount >= 300 },
    { value: "350", label: "350 học phần đã học", isEarned: totalSetsCount >= 350 },
    { value: "400", label: "400 học phần đã học", isEarned: totalSetsCount >= 400 },
    { value: "450", label: "450 học phần đã học", isEarned: totalSetsCount >= 450 },
    { value: "500", label: "500 học phần đã học", isEarned: totalSetsCount >= 500 },
    { value: "600", label: "600 học phần đã học", isEarned: totalSetsCount >= 600 },
    { value: "700", label: "700 học phần đã học", isEarned: totalSetsCount >= 700 },
    { value: "800", label: "800 học phần đã học", isEarned: totalSetsCount >= 800 },
    { value: "900", label: "900 học phần đã học", isEarned: totalSetsCount >= 900 },
    { value: "1k", label: "1.000 học phần đã học", isEarned: totalSetsCount >= 1000 },
    { value: "1.5k", label: "1.500 học phần đã học", isEarned: totalSetsCount >= 1500 },
    { value: "2k", label: "2.000 học phần đã học", isEarned: totalSetsCount >= 2000 },
    { value: "2.5k", label: "2.500 học phần đã học", isEarned: totalSetsCount >= 2500 },
    { value: "3k", label: "3.000 học phần đã học", isEarned: totalSetsCount >= 3000 },
    { value: "3.5k", label: "3.500 học phần đã học", isEarned: totalSetsCount >= 3500 },
    { value: "4k", label: "4.000 học phần đã học", isEarned: totalSetsCount >= 4000 },
    { value: "4.5k", label: "4.500 học phần đã học", isEarned: totalSetsCount >= 4500 },
    { value: "5k", label: "5.000 học phần đã học", isEarned: totalSetsCount >= 5000 },
  ];

  const studyRoundsBadges = [
    { value: "1", label: "Đã học lượt đầu", isEarned: totalRounds >= 1, date: getMockDate(15) },
    { value: "3", label: "3 lượt đã học", isEarned: totalRounds >= 3, date: getMockDate(12) },
    { value: "5", label: "5 lượt đã học", isEarned: totalRounds >= 5, date: getMockDate(10) },
    { value: "10", label: "10 lượt đã học", isEarned: totalRounds >= 10, date: getMockDate(8) },
    { value: "25", label: "25 lượt đã học", isEarned: totalRounds >= 25, date: getMockDate(6) },
    { value: "50", label: "50 lượt đã học", isEarned: totalRounds >= 50, date: getMockDate(4) },
    { value: "75", label: "75 lượt đã học", isEarned: totalRounds >= 75, date: getMockDate(3) },
    { value: "100", label: "100 lượt đã học", isEarned: totalRounds >= 100, date: getMockDate(2) },
    { value: "150", label: "150 lượt đã học", isEarned: totalRounds >= 150, date: getMockDate(1) },
    { value: "200", label: "200 lượt đã học", isEarned: totalRounds >= 200 },
    { value: "250", label: "250 lượt đã học", isEarned: totalRounds >= 250 },
    { value: "300", label: "300 lượt đã học", isEarned: totalRounds >= 300 },
    { value: "350", label: "350 lượt đã học", isEarned: totalRounds >= 350 },
    { value: "400", label: "400 lượt đã học", isEarned: totalRounds >= 400 },
    { value: "450", label: "450 lượt đã học", isEarned: totalRounds >= 450 },
    { value: "500", label: "500 lượt đã học", isEarned: totalRounds >= 500 },
    { value: "600", label: "600 lượt đã học", isEarned: totalRounds >= 600 },
    { value: "700", label: "700 lượt đã học", isEarned: totalRounds >= 700 },
    { value: "800", label: "800 lượt đã học", isEarned: totalRounds >= 800 },
    { value: "900", label: "900 lượt đã học", isEarned: totalRounds >= 900 },
    { value: "1k", label: "1.000 lượt đã học", isEarned: totalRounds >= 1000 },
    { value: "1.5k", label: "1.500 lượt đã học", isEarned: totalRounds >= 1500 },
    { value: "2k", label: "2.000 lượt đã học", isEarned: totalRounds >= 2000 },
    { value: "2.5k", label: "2.500 lượt đã học", isEarned: totalRounds >= 2500 },
    { value: "3k", label: "3.000 lượt đã học", isEarned: totalRounds >= 3000 },
    { value: "3.5k", label: "3.500 lượt đã học", isEarned: totalRounds >= 3500 },
    { value: "4k", label: "4.000 lượt đã học", isEarned: totalRounds >= 4000 },
    { value: "4.5k", label: "4.500 lượt đã học", isEarned: totalRounds >= 4500 },
    { value: "5k", label: "5.000 lượt đã học", isEarned: totalRounds >= 5000 },
  ];

  // Helper arrays for mini-calendar rendering (June 2026 placeholder layout matches user photo)
  const daysInJune = Array.from({ length: 30 }, (_, i) => i + 1);
  const startDayOffset = 0; // Starts on Monday for offset

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 select-none animate-in fade-in duration-300">
      
      {/* 1. Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Thành tựu</h1>
      </div>

      {/* 2. Recent Activity Block (Resembling image 1) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Hoạt động gần đây</h2>
        <div className="grid gap-6 md:grid-cols-3 border rounded-2xl p-6 bg-card shadow-sm items-center">
          
          {/* Left: Study rounds milestone badge */}
          <div className="flex flex-col items-center text-center space-y-2 py-4 border-b md:border-b-0 md:border-r">
            <span className="text-sm font-extrabold">Mới đạt được</span>
            <span className="text-xs text-muted-foreground font-semibold">{totalRounds} lượt đã học</span>
            
            {/* Round milestone graphic badge */}
            <div className="relative h-28 w-24 text-blue-600 flex items-center justify-center mt-2 shrink-0">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 120" fill="none">
                <path d="M50 5 L90 20 L90 75 C90 98 70 115 50 120 C30 115 10 98 10 75 L10 20 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="5" />
                <path d="M22 68 L42 88 L78 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-black text-xl z-10">{totalRounds > 0 ? totalRounds : "0"}</span>
            </div>
          </div>

          {/* Middle: Activity Calendar (matching image 1 date-grid) */}
          <div className="flex flex-col items-center space-y-3 py-4 border-b md:border-b-0 md:border-r px-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-extrabold">tháng 6 năm 2026</span>
              <div className="flex gap-1">
                <button className="p-1 border rounded-lg hover:bg-accent"><ChevronDown size={14} className="rotate-90" /></button>
                <button className="p-1 border rounded-lg hover:bg-accent"><ChevronDown size={14} className="-rotate-90" /></button>
              </div>
            </div>

            <div className="w-full grid grid-cols-7 gap-y-1.5 gap-x-2 text-center text-xs">
              {/* Day Labels */}
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="text-muted-foreground/60 font-semibold">{d}</span>
              ))}
              
              {/* Calendar Grid Days */}
              {Array.from({ length: startDayOffset }).map((_, i) => <span key={i} />)}
              {daysInJune.map((d) => {
                // Highlighting active study days (Mocked flame days or real activities matching d)
                const isStudyDay = d === 7 || d === 8;
                return (
                  <div key={d} className="relative h-6 w-6 mx-auto flex items-center justify-center font-bold">
                    {isStudyDay ? (
                      <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                        <Flame size={20} className="fill-current" />
                        <span className="absolute text-[8px] text-white font-black top-2">{d}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/90">{d}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Streaks flame */}
          <div className="flex flex-col items-center text-center space-y-2 py-4">
            <span className="text-sm font-extrabold">Chuỗi hiện tại</span>
            <span className="text-xs text-muted-foreground font-semibold">{currentStreak} ngày</span>

            <div className="flex items-center justify-center mt-3 text-orange-500 shrink-0 relative animate-pulse">
              <Flame size={60} className="fill-current stroke-[1.5]" />
              {currentStreak > 0 && (
                <span className="absolute text-white font-black text-sm pt-2">{currentStreak}</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Section Study (Học tập) */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold tracking-tight border-b pb-2">Học tập</h2>
        <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 border rounded-2xl p-6 bg-card shadow-sm">
          {studyBadges.map((badge, i) => (
            <ShieldBadge 
              key={i}
              value={badge.value}
              label={badge.label}
              isEarned={badge.isEarned}
              color={badge.color as "blue"}
              date={badge.date}
            />
          ))}
        </div>
      </div>

      {/* 4. Section Daily Streaks (Chuỗi ngày) */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold tracking-tight border-b pb-2">Chuỗi</h2>
        
        <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm">Chuỗi ngày</h3>
          </div>
          
          <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {dailyStreakBadges.slice(0, limitStreaks).map((badge, i) => (
              <ShieldBadge 
                key={i}
                value={badge.value}
                label={badge.label}
                isEarned={badge.isEarned}
                color="green"
                date={badge.date}
              />
            ))}
          </div>

          <div className="flex justify-center border-t pt-4">
            <button 
              onClick={() => setLimitStreaks(limitStreaks === 6 ? dailyStreakBadges.length : 6)}
              className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground text-xs font-bold py-2 px-5 rounded-full border transition-all"
            >
              <span>{limitStreaks === 6 ? "Xem thêm" : "Ẩn bớt"}</span>
              {limitStreaks === 6 ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Section Weekly Streaks (Chuỗi hàng tuần) */}
      <div className="space-y-4">
        <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm">Chuỗi hàng tuần</h3>
          </div>
          
          <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {weeklyStreakBadges.slice(0, limitWeekly).map((badge, i) => (
              <ShieldBadge 
                key={i}
                value={badge.value}
                label={badge.label}
                isEarned={badge.isEarned}
                color="orange"
                date={badge.date}
              />
            ))}
          </div>

          <div className="flex justify-center border-t pt-4">
            <button 
              onClick={() => setLimitWeekly(limitWeekly === 6 ? weeklyStreakBadges.length : 6)}
              className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground text-xs font-bold py-2 px-5 rounded-full border transition-all"
            >
              <span>{limitWeekly === 6 ? "Xem thêm" : "Ẩn bớt"}</span>
              {limitWeekly === 6 ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* 6. Section Sets Studied (Học phần đã học) */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold tracking-tight border-b pb-2">Toàn bộ</h2>
        
        <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm">Học phần đã học</h3>
          </div>
          
          <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {studySetsBadges.slice(0, limitStudySets).map((badge, i) => (
              <ShieldBadge 
                key={i}
                value={badge.value}
                label={badge.label}
                isEarned={badge.isEarned}
                color="purple"
                date={badge.date}
              />
            ))}
          </div>

          <div className="flex justify-center border-t pt-4">
            <button 
              onClick={() => setLimitStudySets(limitStudySets === 6 ? studySetsBadges.length : 6)}
              className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground text-xs font-bold py-2 px-5 rounded-full border transition-all"
            >
              <span>{limitStudySets === 6 ? "Xem thêm" : "Ẩn bớt"}</span>
              {limitStudySets === 6 ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* 7. Section Study Rounds (Số lượt đã học) */}
      <div className="space-y-4">
        <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm">Số lượt đã học</h3>
          </div>
          
          <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {studyRoundsBadges.slice(0, limitRounds).map((badge, i) => (
              <ShieldBadge 
                key={i}
                value={badge.value}
                label={badge.label}
                isEarned={badge.isEarned}
                color="blue"
                date={badge.date}
              />
            ))}
          </div>

          <div className="flex justify-center border-t pt-4">
            <button 
              onClick={() => setLimitRounds(limitRounds === 12 ? studyRoundsBadges.length : 12)}
              className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground text-xs font-bold py-2 px-5 rounded-full border transition-all"
            >
              <span>{limitRounds === 12 ? "Xem thêm" : "Ẩn bớt"}</span>
              {limitRounds === 12 ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AchievementsClient;
