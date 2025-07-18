import { Buffer } from "node:buffer"
import crypto from "node:crypto"

const algorithm = "aes-256-cbc"
const secret = process.env.SECRET_KEY

if (!secret || secret.length < 32) {
  throw new Error("SECRET_KEY must be set and at least 32 characters long")
}

const key = crypto.createHash("sha256").update(secret).digest()
const ivLength = 16

export function encrypt(input: string): string {
  try {
    const iv = crypto.randomBytes(ivLength)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = Buffer.concat([cipher.update(input, "utf8"), cipher.final()])
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`
  }
  catch (error: any) {
    console.error("Encryption failed:", error)
    throw new Error("Encryption failed")
  }
}

export function decrypt(output: string): string {
  try {
    const [ivHex, encryptedHex] = output.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const encrypted = Buffer.from(encryptedHex, "hex")
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString("utf8")
  }
  catch (error: any) {
    console.error("Decryption failed:", error)
    throw new Error("Decryption failed")
  }
}
