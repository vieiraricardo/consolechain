import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { homedir } from 'os'
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'
import { Config } from '../types'

const scryptAsync = promisify(scrypt)
const CONFIG_PATH = `${homedir()}/.config/consolechain.json`
const ENCRYPTION_KEY_ENV = 'CONSOLECHAIN_ENCRYPTION_KEY'

/**
 * Encrypts data using AES-256-GCM
 */
async function encrypt(text: string, password: string): Promise<string> {
  const iv = randomBytes(16)
  const salt = randomBytes(16)
  const key = (await scryptAsync(password, salt, 32)) as Buffer

  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return JSON.stringify({
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted.toString('hex'),
  })
}

/**
 * Decrypts data using AES-256-GCM
 */
async function decrypt(
  encryptedData: string,
  password: string,
): Promise<string> {
  const { iv, salt, authTag, data } = JSON.parse(encryptedData)
  const key = (await scryptAsync(
    password,
    Buffer.from(salt, 'hex'),
    32,
  )) as Buffer

  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data, 'hex')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Gets encryption key from environment or generates a warning
 */
function getEncryptionKey(): string {
  const key = process.env[ENCRYPTION_KEY_ENV]
  if (!key) {
    console.warn(
      `Warning: ${ENCRYPTION_KEY_ENV} not set. Private key will be stored in plain text.`,
    )
    console.warn(
      `Set ${ENCRYPTION_KEY_ENV} environment variable to encrypt your private key.`,
    )
    return ''
  }
  return key
}

/**
 * Loads configuration from disk
 */
export function loadConfig(): Config | null {
  if (!existsSync(CONFIG_PATH)) {
    return null
  }

  try {
    const configData = readFileSync(CONFIG_PATH, 'utf8')
    const config = JSON.parse(configData)

    // If privateKey is encrypted, decrypt it
    if (config.encryptedPrivateKey) {
      const encryptionKey = getEncryptionKey()
      if (encryptionKey) {
        config.privateKey = decrypt(config.encryptedPrivateKey, encryptionKey)
          .then((key) => key)
          .catch(() => {
            console.error('Failed to decrypt private key')
            return undefined
          })
      }
    }

    return config
  } catch (error) {
    console.error('Failed to load config:', error)
    return null
  }
}

/**
 * Saves configuration to disk
 */
export async function saveConfig(config: Config): Promise<void> {
  const configDir = dirname(CONFIG_PATH)
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  const encryptionKey = getEncryptionKey()
  const configToSave: any = { ...config }

  // Encrypt private key if encryption key is available
  if (config.privateKey && encryptionKey) {
    configToSave.encryptedPrivateKey = await encrypt(
      config.privateKey,
      encryptionKey,
    )
    delete configToSave.privateKey
  }

  writeFileSync(CONFIG_PATH, JSON.stringify(configToSave, null, 2), 'utf8')
}

/**
 * Validates a private key format
 */
export function isValidPrivateKey(key: string): boolean {
  // Check if it's a valid hex string of correct length (64 chars + optional 0x prefix)
  const hexPattern = /^(0x)?[a-fA-F0-9]{64}$/
  return hexPattern.test(key)
}
