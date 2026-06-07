"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  MoreHorizontal, 
  Plus, 
  X, 
  Link2, 
  School,
  Play,
  Activity,
  Award,
  BookOpen,
  Copy,
  GraduationCap,
  FilePen,
  Puzzle,
  Edit2,
  Trash2,
  Bell,
  Pin,
  AlertTriangle
} from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@acme/ui/tabs";
import { toast } from "@acme/ui/toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@acme/ui/dropdown-menu";

import { api } from "~/trpc/react";
import FolderDialog from "../folder/folder-dialog";

interface ClassDetailClientProps {
  classData: {
    id: string;
    name: string;
    schoolName: string;
    cityName: string;
    countryName: string;
    slug: string;
    userId: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    studySets: { id: string; title: string }[];
    folders: { id: string; name: string; slug: string }[];
  };
  session: Session | null;
}

const ClassDetailClient = ({ classData, session }: ClassDetailClientProps) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [activeTab, setActiveTab] = useState("materials");
  const [showYellowBanner, setShowYellowBanner] = useState(true);
  const [showGreenBanner, setShowGreenBanner] = useState(true);
  const [emailsInput, setEmailsInput] = useState("");
  
  const isOwner = session?.user.id === classData.userId;

  // Mutation for deleting the class
  const deleteClass = api.class.delete.useMutation({
    onSuccess() {
      toast.success("Đã xóa lớp học thành công!");
      router.push("/latest");
    },
    onError() {
      toast.error("Không thể xóa lớp học.");
    },
  });

  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("Đã sao chép liên kết lớp học!"))
      .catch(() => toast.error("Không thể sao chép liên kết."));
  };

  const handleSendInvites = () => {
    if (!emailsInput.trim()) return;
    toast.success(`Đã gửi lời mời học tới các email!`);
    setEmailsInput("");
  };

  const handleDeleteClass = () => {
    if (confirm("Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.")) {
      deleteClass.mutate({ id: classData.id });
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6 select-none animate-in fade-in duration-300">
      {/* 1. Yellow Promo Banner */}
      {showYellowBanner && (
        <div className="bg-amber-100 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-amber-400">Mời học sinh tham gia lớp này</h4>
            <p className="text-xs text-slate-700 dark:text-amber-300">
              Học sinh có quyền truy cập miễn phí vào các hoạt động và tài liệu mà bạn thêm vào lớp học của mình.
            </p>
          </div>
          <button 
            onClick={() => setShowYellowBanner(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Class Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{classData.name}</h1>
            
            {/* options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 p-1">
                <DropdownMenuItem onClick={() => toast.info("Tính năng chỉnh sửa đang phát triển!")} className="flex items-center gap-2 cursor-pointer py-2">
                  <Edit2 size={15} />
                  <span>Sửa</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("members")} className="flex items-center gap-2 cursor-pointer py-2">
                  <Users size={15} />
                  <span>Mời</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Đã bật nhận thông báo từ lớp học này")} className="flex items-center gap-2 cursor-pointer py-2">
                  <Bell size={15} />
                  <span>Thông báo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Đã ghim lớp học lên đầu danh sách thanh bên")} className="flex items-center gap-2 cursor-pointer py-2">
                  <Pin size={15} />
                  <span>Ghim vào thanh bên</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm!")} className="flex items-center gap-2 cursor-pointer py-2">
                  <AlertTriangle size={15} />
                  <span>Báo cáo</span>
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={handleDeleteClass} className="flex items-center gap-2 cursor-pointer py-2 text-destructive focus:text-destructive">
                      <Trash2 size={15} />
                      <span>Xóa</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Đã xóa tất cả học sinh khỏi lớp")} className="flex items-center gap-2 cursor-pointer py-2 text-destructive focus:text-destructive">
                      <X size={15} />
                      <span>Xóa mọi thành viên</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
            <School size={16} />
            <span>{classData.schoolName} &middot; {classData.cityName}</span>
          </div>
        </div>

        {/* Action button Add Content */}
        {isOwner && (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
                  <Plus size={16} />
                  <span>Thêm nội dung</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => toast.info("Tính năng thêm học phần sẽ được phát triển sớm!")}>
                  Thêm học phần
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Tính năng thêm thư mục sẽ được phát triển sớm!")}>
                  Thêm thư mục
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* 3. Custom Tabs Nav */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto gap-8">
          <TabsTrigger 
            value="materials" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
          >
            Tài liệu học
          </TabsTrigger>
          <TabsTrigger 
            value="members" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
          >
            Thành viên
          </TabsTrigger>
          <TabsTrigger 
            value="tools" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
          >
            Công cụ học
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
          >
            Tiến độ
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 4. Tab Contents */}
      <div className="pt-4">
        {/* Tab 1: Materials */}
        {activeTab === "materials" && (
          <div className="flex flex-col items-center justify-center text-center py-16 max-w-lg mx-auto space-y-6">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Học phần giúp các thành viên trong lớp dễ dàng nghiên cứu nội dung của bạn trong các hoạt động như Học và Kiểm tra.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button onClick={() => toast.info("Thêm học phần...")} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-5 h-auto transition-all active:scale-95 shadow-md">
                Thêm học phần
              </Button>
              <button onClick={() => toast.info("Tìm học phần...")} className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-sm">
                Tìm học phần
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {/* Quick Invites Blocks */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Mời bằng nền tảng giáo dục của bạn</h4>
                  <p className="text-xs text-muted-foreground">Nhập danh sách lớp học trực tiếp từ Google Classroom.</p>
                </div>
                <button 
                  onClick={() => toast.info("Kết nối Google Classroom...")}
                  className="flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent transition-colors"
                >
                  <span className="h-4 w-4 bg-yellow-500 rounded-full inline-block flex items-center justify-center text-white text-[8px] font-bold">G</span>
                  <span>Mời bằng Google</span>
                </button>
              </div>

              <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Mời bằng cách chia sẻ liên kết</h4>
                  <p className="text-xs text-muted-foreground">Học sinh có thể click vào liên kết này để tự tham gia lớp học của bạn.</p>
                </div>
                <Button 
                  onClick={handleCopyLink}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs py-2 px-4 h-auto"
                >
                  <Copy size={14} />
                  <span>Chép liên kết</span>
                </Button>
              </div>
            </div>

            {/* Green Notification Banner */}
            {showGreenBanner && (
              <div className="bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                  <Activity size={16} />
                  <span>Khi bạn bắt đầu sử dụng các hoạt động, bạn sẽ tìm thấy chúng trong thư viện của bạn.</span>
                </div>
                <button 
                  onClick={() => setShowGreenBanner(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Email Invite Box */}
            <div className="border rounded-2xl p-6 bg-card space-y-4">
              <h4 className="font-extrabold text-sm tracking-tight">Mời qua email</h4>
              <textarea
                className="w-full min-h-[100px] border rounded-xl p-3 bg-secondary text-secondary-foreground text-sm focus:outline-none focus:border-border transition-colors placeholder:text-muted-foreground/60"
                placeholder="Nhập tên người dùng hoặc địa chỉ email (ngăn cách bởi dấu phẩy hay xuống dòng)"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Giới hạn 200 email</span>
                <Button 
                  disabled={!emailsInput.trim()}
                  onClick={handleSendInvites}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 text-xs h-auto disabled:opacity-50"
                >
                  Gửi lời mời
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Learning Tools */}
        {activeTab === "tools" && (
          <div className="space-y-8">
            {/* Section 1: Games */}
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold tracking-tight">Trò chơi</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Quizlet Live */}
                <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Activity size={18} />
                      </div>
                      <h4 className="font-bold text-sm">Quizlet Live</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Quizlet Live là một trò chơi cộng tác nhiều người chơi, giúp người học nắm vững tài liệu bạn đang giảng dạy.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                    <button className="text-muted-foreground hover:text-foreground font-semibold">Xem trước</button>
                    <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                      Bắt đầu
                      <Play size={10} className="fill-current" />
                    </button>
                  </div>
                </div>

                {/* Blast */}
                <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Award size={18} />
                      </div>
                      <h4 className="font-bold text-sm">Blast</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Blast là một trò chơi cạnh tranh trong đó học sinh phải hủy nhiều câu trả lời đúng nhất trước khi hết giờ.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                    <button className="text-muted-foreground hover:text-foreground font-semibold">Xem trước</button>
                    <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                      Bắt đầu
                      <Play size={10} className="fill-current" />
                    </button>
                  </div>
                </div>

                {/* Match (Ghép thẻ) */}
                <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Puzzle size={18} />
                      </div>
                      <h4 className="font-bold text-sm">Ghép thẻ</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ghép thẻ thu hút học sinh vào một trò chơi có nhịp độ nhanh, tại đó các em cạnh tranh với nhau để ghép các thuật ngữ và định nghĩa.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                    <button className="text-muted-foreground hover:text-foreground font-semibold">Xem trước</button>
                    <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                      Bắt đầu
                      <Play size={10} className="fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Study and Memorize */}
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold tracking-tight">Ôn tập và ghi nhớ</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Thẻ ghi nhớ */}
                <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between min-h-[160px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Copy size={18} />
                      </div>
                      <h4 className="font-bold text-sm">Thẻ ghi nhớ</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Thẻ ghi nhớ giúp học sinh củng cố tài liệu bằng cách chủ động gợi nhớ ôn tập.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                    <button className="text-muted-foreground hover:text-foreground font-semibold">Xem trước</button>
                    <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                      Bắt đầu
                      <Play size={10} className="fill-current" />
                    </button>
                  </div>
                </div>

                {/* Học */}
                <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between min-h-[160px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <GraduationCap size={18} />
                      </div>
                      <h4 className="font-bold text-sm">Học</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Học giúp học sinh ôn luyện tài liệu của bạn dưới dạng câu hỏi trắc nghiệm và hỏi đáp ngắn.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                    <button className="text-muted-foreground hover:text-foreground font-semibold">Xem trước</button>
                    <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                      Bắt đầu
                      <Play size={10} className="fill-current" />
                    </button>
                  </div>
                </div>

                {/* Kiểm tra */}
                <div className="border rounded-2xl p-5 bg-card flex flex-col justify-between min-h-[160px] md:col-span-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FilePen size={18} />
                      </div>
                      <h4 className="font-bold text-sm">Kiểm tra</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Kiểm tra cho phép học sinh làm các bài đánh giá mô phỏng với chất lượng cao. Phân tích điểm mạnh và điểm yếu.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                    <button className="text-muted-foreground hover:text-foreground font-semibold">Xem trước</button>
                    <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                      Bắt đầu
                      <Play size={10} className="fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Progress */}
        {activeTab === "progress" && (
          <div className="space-y-8">
            {/* Action buttons similar to Members tab */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => toast.info("Mời bằng Google Classroom...")}
                className="flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent transition-colors"
              >
                <span className="h-4 w-4 bg-yellow-500 rounded-full inline-block flex items-center justify-center text-white text-[8px] font-bold">G</span>
                <span>Mời bằng Google</span>
              </button>

              <button 
                onClick={() => toast.info("Hãy nhập email học sinh trong tab Thành viên")}
                className="flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent transition-colors"
              >
                <span>Mời bằng email</span>
              </button>

              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent transition-colors"
              >
                <Link2 size={14} />
                <span>Chép liên kết</span>
              </button>
            </div>

            {/* Green Notification Banner */}
            {showGreenBanner && (
              <div className="bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                  <Activity size={16} />
                  <span>Khi bạn bắt đầu sử dụng các hoạt động, bạn sẽ tìm thấy chúng trong thư viện của bạn.</span>
                </div>
                <button 
                  onClick={() => setShowGreenBanner(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Instructions box */}
            <div className="flex flex-col items-center justify-center text-center py-12 border rounded-2xl bg-card space-y-4 max-w-lg mx-auto">
              <h4 className="font-extrabold text-lg">Thêm học phần vào lớp này</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Sau khi thêm học phần, bạn sẽ có thể theo dõi tiến độ và điểm số của học sinh trong các chế độ ôn tập.
              </p>
              <Button onClick={() => toast.info("Thêm học phần...")} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 text-xs h-auto">
                Thêm học phần
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetailClient;
