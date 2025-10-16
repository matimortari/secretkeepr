import { Buffer } from "node:buffer"
import crypto from "node:crypto"

const algorithm = "aes-256-cbc"
const secret = process.env.ENCRYPTION_KEY
if (!secret || secret.length < 32) {
  throw new Error("ENCRYPTION_KEY must be set and at least 32 characters long")
}

const key = crypto.createHash("sha256").update(secret).digest()

export function encrypt(input: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = Buffer.concat([cipher.update(input, "utf8"), cipher.final()])
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`
  }
  catch (err: any) {
    console.error("Encryption failed:", err)
    throw new Error("Encryption failed")
  }
}

export function decrypt(output: string): string {
  try {
    const [ivHex, encryptedHex] = output.split(":")
    if (!ivHex || !encryptedHex) {
      throw new Error("Invalid encrypted input format")
    }
    const iv = Buffer.from(ivHex, "hex")
    const encrypted = Buffer.from(encryptedHex, "hex")
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString("utf8")
  }
  catch (err: any) {
    console.error("Decryption failed:", err)
    throw new Error("Decryption failed")
  }
}
