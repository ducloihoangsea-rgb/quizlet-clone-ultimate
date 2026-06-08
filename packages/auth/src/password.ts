import crypto from "crypto";

/**
 * Băm mật khẩu sử dụng PBKDF2 với SHA-512
 * Định dạng đầu ra: salt:hash_hex
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Kiểm tra xem mật khẩu nhập vào có trùng khớp với chuỗi băm cũ không
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = hash.split(":");
    const salt = parts[0];
    const key = parts[1];
    
    if (!salt || !key) {
      return resolve(false);
    }
    
    crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString("hex") === key);
    });
  });
}
