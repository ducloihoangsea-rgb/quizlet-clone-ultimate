import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Calendar, Users, FileCheck, HelpCircle } from "lucide-react";

import { auth } from "@acme/auth";
import { Button } from "@acme/ui/button";

import ActivityCalendar from "~/components/user/activity-calendar";
import { api } from "~/trpc/server";

interface UserOverviewProps {
  params: { id: string };
  searchParams?: { tab?: string };
}

export async function generateMetadata({
  params: { id },
}: UserOverviewProps): Promise<Metadata> {
  const { name } = await api.user.byId({ id });

  return {
    title: name,
  };
}

export default async function UserOverview({
  params: { id },
  searchParams,
}: UserOverviewProps) {
  const session = await auth();

  if (!session) {
    redirect(`/users/${id}/study-sets`);
  }

  const activeTab = searchParams?.tab ?? "overview";
  const activity = await api.activity.allByUser();

  // 1. Render Classes Tab UI
  if (activeTab === "classes") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 max-w-md mx-auto">
        <div className="p-4 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 rounded-full mb-4">
          <Users size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">Chưa có lớp học nào</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Tạo lớp học hoặc tham gia một lớp học để chia sẻ học phần và cùng nhau học tập hiệu quả hơn!
        </p>
        <Button className="rounded-full">Tạo lớp học mới</Button>
      </div>
    );
  }

  // 2. Render Mock Tests Tab UI
  if (activeTab === "mock-tests") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 max-w-md mx-auto">
        <div className="p-4 bg-green-100 dark:bg-green-950/40 text-green-600 rounded-full mb-4">
          <FileCheck size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">Bài kiểm tra thử miễn phí</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Tự đánh giá năng lực của bản thân bằng cách làm các bài thi thử trắc nghiệm được mô phỏng sát đề thi thực tế.
        </p>
        <Button className="rounded-full">Tìm bài thi thử</Button>
      </div>
    );
  }

  // 3. Render Expert Solutions Tab UI
  if (activeTab === "expert-solutions") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 max-w-md mx-auto">
        <div className="p-4 bg-purple-100 dark:bg-purple-950/40 text-purple-600 rounded-full mb-4">
          <HelpCircle size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">Lời giải từ chuyên gia</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Xem hướng dẫn giải chi tiết từng bước cho hàng ngàn câu hỏi trong sách giáo khoa phổ thông và đại học.
        </p>
        <Button className="rounded-full">Tra cứu sách giáo khoa</Button>
      </div>
    );
  }

  // 4. Default: Render Activity Tab UI (Resembling image 2)
  return (
    <div className="space-y-12">
      {/* Activity Welcome Header (Resembling image 2) */}
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
        {/* Mock Illustration representing activity engagement */}
        <div className="w-48 h-32 flex items-center justify-center mb-6 relative">
          <div className="absolute top-2 left-6 bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 z-10 animate-bounce">
            <span className="h-1.5 w-1.5 bg-white rounded-full inline-block animate-ping"></span>
            Lưu
          </div>
          <svg className="w-full h-full text-blue-500" viewBox="0 0 160 100" fill="none">
            <circle cx="80" cy="50" r="16" fill="#22c55e" fillOpacity="0.2" />
            <circle cx="80" cy="50" r="8" fill="#22c55e" />
            <path d="M76 50L79 53L85 47" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="30" y="55" width="40" height="6" rx="2" fill="currentColor" fillOpacity="0.1" />
            <rect x="30" y="65" width="30" height="6" rx="2" fill="currentColor" fillOpacity="0.1" />
            <rect x="30" y="75" width="36" height="6" rx="2" fill="currentColor" fillOpacity="0.1" />
            
            <rect x="90" y="55" width="40" height="6" rx="2" fill="#22c55e" fillOpacity="0.2" />
            <rect x="90" y="65" width="34" height="6" rx="2" fill="#22c55e" fillOpacity="0.2" />
            <rect x="90" y="75" width="18" height="6" rx="2" fill="#22c55e" fillOpacity="0.2" />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight mb-3">
          Giao hoạt động để duy trì tương tác với học sinh
        </h2>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Theo dõi việc hoàn thành và cấp quyền truy cập miễn phí cho các hoạt động bạn giao mà không cần mở tài khoản Quizlet.
        </p>

        <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-5 text-sm h-auto active:scale-95 transition-all">
          Bắt đầu
        </Button>
      </div>

      {/* Actual user activity logs */}
      <div className="border-t pt-8">
        <h2 className="mb-6 text-xl font-bold tracking-tight">Nhật ký hoạt động của bạn</h2>
        <div className="flex items-center justify-center rounded-2xl bg-secondary/40 border p-6">
          <ActivityCalendar activity={activity} />
        </div>
      </div>
    </div>
  );
}
