"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@acme/ui/button";

interface GameResultProps {
  cardCount: number;
  knownCount: number;
  learningCount: number;
  onUndo: () => void;
  onLearnMode: () => void;
  onReviewHard: () => void;
  onReset: () => void;
}

const GameResult = ({
  cardCount,
  knownCount,
  learningCount,
  onUndo,
  onLearnMode,
  onReviewHard,
  onReset,
}: GameResultProps) => {
  const progressValue = +((knownCount / cardCount) * 100).toFixed(0);
  const remainingCount = Math.max(0, cardCount - knownCount - learningCount);

  const titleText = learningCount > 0
    ? "Tuyệt vời! Bạn đã gần tới đích."
    : "Xuất sắc! Bạn đã nắm vững tất cả.";

  return (
    <div className="mb-6 flex flex-col gap-8 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold md:text-5xl text-white">{titleText}</h2>
        <div className="relative h-20 w-24 md:h-28 md:w-36 flex-shrink-0">
          {/* We can use the existing permafetti icon */}
          <img src="/permafetti.svg" alt="Hoan hô" className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="flex flex-col gap-12 md:flex-row md:gap-16">
        {/* Left Side: Progress */}
        <div className="flex-1">
          <h3 className="mb-6 text-xl font-bold text-white">Tiến độ của bạn</h3>
          
          <div className="flex items-center gap-8">
            {/* Custom SVG Progress Ring */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#2F3346"
                  strokeWidth="12"
                />
                {/* Đang học (Cam) - Background layer for non-known parts */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#FF905E"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * ((knownCount + learningCount) / cardCount))}
                />
                {/* Đã biết (Xanh) - Top layer */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#23B383"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (knownCount / cardCount))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{progressValue}%</span>
              </div>
            </div>

            {/* Stats List */}
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center justify-between px-4 py-2 bg-[#23B383]/10 text-[#23B383] rounded-3xl font-bold">
                <span>Đã biết</span>
                <span>{knownCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-[#FF905E]/10 text-[#FF905E] rounded-3xl font-bold">
                <span>Đang học</span>
                <span>{learningCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-[#575B71]/20 text-[#575B71] dark:text-[#939BB4] rounded-3xl font-bold">
                <span>Còn lại</span>
                <span>{remainingCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button 
              onClick={onUndo}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại câu hỏi cuối cùng
            </button>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex-1">
          <h3 className="mb-6 text-xl font-bold text-white">Bước tiếp theo</h3>
          
          <div className="flex flex-col gap-4">
            <Button
              onClick={onLearnMode}
              className="w-full h-16 rounded-full bg-[#4255FF] hover:bg-[#4255FF]/90 text-white font-bold text-lg"
            >
              Ôn luyện với các câu hỏi
            </Button>
            
            {learningCount > 0 && (
              <Button
                onClick={onReviewHard}
                className="w-full h-16 rounded-full bg-[#2E3856] hover:bg-[#2E3856]/80 text-white font-bold text-lg"
              >
                Tập trung vào học {learningCount} thẻ
              </Button>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={onReset}
                className="text-sm font-bold text-white hover:underline"
              >
                Đặt lại Thẻ ghi nhớ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameResult;