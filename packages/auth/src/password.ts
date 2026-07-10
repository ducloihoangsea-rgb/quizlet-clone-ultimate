/**
 * Băm mật khẩu sử dụng PBKDF2 với SHA-512 bằng Web Crypto API (Tương thích Edge Runtime)
 * Định dạng đầu ra: salt:hash_hex
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 1000,
      hash: "SHA-512",
    },
    keyMaterial,
    64 * 8 // 64 bytes = 512 bits
  );

  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const derivedHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, "0")).join("");

  return `${saltHex}:${derivedHex}`;
}

/**
 * Kiểm tra xem mật khẩu nhập vào có trùng khớp với chuỗi băm cũ không
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split(":");
  const saltHex = parts[0];
  const keyHex = parts[1];
  
  if (!saltHex || !keyHex) {
    return false;
  }
  
  const saltMatch = saltHex.match(/.{1,2}/g);
  if (!saltMatch) return false;
  const salt = new Uint8Array(saltMatch.map(byte => parseInt(byte, 16)));
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 1000,
      hash: "SHA-512",
    },
    keyMaterial,
    64 * 8 // 512 bits
  );

  const derivedHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, "0")).join("");
  
  return derivedHex === keyHex;
}
