import CryptoJS from 'crypto-js'

// Derive a strong encryption key from the user's PIN
// PBKDF2 stretches a short PIN into a strong 256-bit key
export function deriveKey(pin) {
  const salt = 'keyvault-salt-v1' // fixed salt for consistency
  return CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString()
}

// Encrypt a password using AES-256
// Returns: { ciphertext, iv }
export function encryptPassword(plainText, pin) {
  const key = deriveKey(pin)
  const iv = CryptoJS.lib.WordArray.random(16).toString() // random IV every time
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return {
    ciphertext: encrypted.toString(),
    iv: iv,
  }
}

// Decrypt a password using AES-256
// Returns: plain text string
export function decryptPassword(ciphertext, iv, pin) {
  try {
    const key = deriveKey(pin)
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch {
    return null // wrong PIN or corrupted data
  }
}