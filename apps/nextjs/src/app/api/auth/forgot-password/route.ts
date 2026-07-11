import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@acme/db/client";
import { User } from "@acme/db/schema";
import * as nodemailer from "nodemailer";

// Tạo token reset đơn giản bằng Web Crypto API (tương thích Edge)
async function createResetToken(userId: string, email: string): Promise<string> {
  const payload = JSON.stringify({
    userId,
    email,
    exp: Date.now() + 30 * 60 * 1000, // Hết hạn sau 30 phút
  });
  // Encode base64url
  const encoded = btoa(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return encoded;
}

function decodeResetToken(token: string): { userId: string; email: string; exp: number } | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch {
    return null;
  }
}

// Tạo transporter gửi mail qua Gmail SMTP
function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "missing_email" }, { status: 400 });
    }

    // Tìm user theo email
    const users = await db.select().from(User).where(eq(User.email, email.trim())).limit(1);
    const user = users[0];

    if (!user) {
      // Không tiết lộ user có tồn tại hay không (bảo mật)
      return NextResponse.json({ success: true });
    }

    // Tạo token
    const token = await createResetToken(user.id, user.email!);

    // Tạo link reset
    const baseUrl = req.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Gửi email
    const transporter = getMailTransporter();
    await transporter.sendMail({
      from: `"Quizlet Clone" <${process.env.SMTP_USER}>`,
      to: user.email!,
      subject: "Đặt lại mật khẩu - Quizlet Clone",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1a1d28; font-size: 24px; margin-bottom: 8px;">Đặt lại mật khẩu</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${user.email}</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Bấm nút bên dưới để tạo mật khẩu mới. Link có hiệu lực trong <strong>30 phút</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: #4255ff; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 100px; font-weight: 700; font-size: 15px;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #d1d5db; font-size: 11px; text-align: center;">Quizlet Clone © 2026</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
