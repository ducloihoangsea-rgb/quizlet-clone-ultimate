import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@acme/db/client";
import { User } from "@acme/db/schema";
import { hashPassword } from "@acme/auth/password";

function decodeResetToken(token: string): { userId: string; email: string; exp: number } | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    // Giải mã token
    const payload = decodeResetToken(token);
    if (!payload) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    // Kiểm tra hết hạn
    if (Date.now() > payload.exp) {
      return NextResponse.json({ error: "token_expired" }, { status: 400 });
    }

    // Tìm user
    const users = await db.select().from(User).where(eq(User.id, payload.userId)).limit(1);
    const user = users[0];

    if (!user || user.email !== payload.email) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    // Băm mật khẩu mới và cập nhật DB
    const hashedPassword = await hashPassword(password);
    await db.update(User).set({ password: hashedPassword }).where(eq(User.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
