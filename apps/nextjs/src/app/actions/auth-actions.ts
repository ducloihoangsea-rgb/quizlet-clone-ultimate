"use server";

import { db } from "@acme/db/client";
import { User } from "@acme/db/schema";
import { hashPassword } from "@acme/auth/password";
import { eq } from "drizzle-orm";

export async function registerUserAction(formData: {
  email: string;
  password?: string;
  username: string;
  birthDate?: string;
}) {
  try {
    const { email, password, username } = formData;

    if (!email || !password || !username) {
      return { error: "missing_fields" };
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUsers = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return { error: "email_exists" };
    }

    // Băm mật khẩu
    const hashedPassword = await hashPassword(password);

    // Tạo user mới
    await db.insert(User).values({
      email,
      password: hashedPassword,
      name: username,
    });

    return { success: true };
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error);
    return { error: "registration_failed" };
  }
}
