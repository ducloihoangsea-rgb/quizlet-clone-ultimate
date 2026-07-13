"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Button } from "@acme/ui/button";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import GoogleIcon from "../icons/google";
import GithubIcon from "../icons/github";
import { signInOAuth } from "./auth-actions";

const SignInDialog = () => {
  const { open, onOpenChange } = useSignInDialogContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentUrl = `${pathname}${search ? `?${search}` : ""}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-center text-3xl font-bold">Đăng ký để học tiếp</DialogTitle>
          <DialogDescription className="text-center text-lg text-foreground mt-4">
            Tạo một tài khoản miễn phí để làm chủ tài liệu học của bạn với chế độ học này
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center text-xs text-muted-foreground mb-8 px-4">
          Bằng việc đăng ký, bạn chấp nhận <span className="font-bold text-foreground">Điều khoản dịch vụ</span> và <span className="font-bold text-foreground">Chính sách quyền riêng tư</span> của Quizlet
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            className="flex-1 rounded-3xl h-14 font-bold text-base bg-gray-50 border-gray-200 text-black hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors"
            onClick={() => signInOAuth("google", currentUrl)}
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
          </Button>

          <Button
            variant="outline"
            className="flex-1 rounded-3xl h-14 font-bold text-base bg-gray-50 border-gray-200 text-black hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors"
            asChild
          >
            <Link href={`/sign-up?callbackUrl=${encodeURIComponent(currentUrl)}`} onClick={() => onOpenChange(false)}>
              <Mail className="mr-2 h-5 w-5" />
              Email
            </Link>
          </Button>

          <Button
            variant="outline"
            className="flex-1 rounded-3xl h-14 font-bold text-base bg-gray-50 border-gray-200 text-black hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors"
            onClick={() => signInOAuth("github", currentUrl)}
          >
            <GithubIcon className="mr-2 h-5 w-5" />
            Github
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
