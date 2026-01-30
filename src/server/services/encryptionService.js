/**
 * Encryption Service Module
 * 
 * Provides AES-256-GCM encryption for sensitive configuration data,
 * specifically API keys. Manages master key generation and storage.
 * 
 * @module services/encryptionService
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/** @constant {string} */
const ALGORITHM = 'aes-256-gcm';

/** @constant {number} */
const IV_LENGTH = 16;

/** @constant {number} */
const SALT_LENGTH = 64;

/** @constant {number} */
const TAG_LENGTH = 16;

/**
 * Provider configuration with encrypted API key
 * @typedef {Object} EncryptedProviderConfig
 * @property {string} npm - NPM package name
 * @property {string} name - Display name
 * @property {Object} options - Provider options
 * @property {string} options.baseURL - Base URL
 * @property {string} options.apiKey - Encrypted API key (format: salt:iv:tag:ciphertext)
 * @property {Object.<string, Object>} models - Model configurations
 */

/**
 * Complete encrypted configuration object
 * @typedef {Object} EncryptedConfig
 * @property {Object.<string, EncryptedProviderConfig>} provider - Map of encrypted provider configs
 */

/**
 * Provider configuration with decrypted API key
 * @typedef {Object} DecryptedProviderConfig
 * @property {string} npm - NPM package name
 * @property {string} name - Display name
 * @property {Object} options - Provider options
 * @property {string} options.baseURL - Base URL
 * @property {string} options.apiKey - Decrypted API key (plaintext)
 * @property {Object.<string, Object>} models - Model configurations
 */

/**
 * Complete decrypted configuration object
 * @typedef {Object} DecryptedConfig
 * @property {Object.<string, DecryptedProviderConfig>} provider - Map of decrypted provider configs
 */

/**
 * Service for encrypting and decrypting sensitive configuration data
 * 
 * Uses AES-256-GCM algorithm for authenticated encryption. Manages
 * a master key stored in the user's home directory for encryption operations.
 * 
 * @class EncryptionService
 */
class EncryptionService {
    /**
     * Creates a new EncryptionService instance
     * 
     * Initializes the service by loading or creating a master encryption key.
     */
    constructor() {
        /** @type {string} */
        this.keyPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config/opencode/.key');
        
        /** @type {Buffer} */
        this.masterKey = this.getOrCreateMasterKey();
    }

    /**
     * Retrieves existing master key or creates a new one
     * 
     * Attempts to read the key from the key file. If not found or on error,
     * generates a new random key and attempts to save it securely.
     * 
     * @returns {Buffer} 32-byte master key
     */
    getOrCreateMasterKey() {
        try {
            if (fs.existsSync(this.keyPath)) {
                return fs.readFileSync(this.keyPath);
            }
        } catch (e) {}

        const key = crypto.randomBytes(32);
        try {
            fs.mkdirSync(path.dirname(this.keyPath), { recursive: true });
            fs.writeFileSync(this.keyPath, key, { mode: 0o600 });
        } catch (e) {
            console.warn('无法创建加密密钥文件，将使用派生密钥');
        }
        return key;
    }

    /**
     * Encrypts a plaintext string
     * 
     * Uses AES-256-GCM with random IV and salt. Returns encrypted
     * data in format: salt:iv:tag:ciphertext
     * 
     * @param {string|null} text - Plaintext to encrypt
     * @returns {string|null} Encrypted string or null if input is empty or on error
     */
    encrypt(text) {
        if (!text) return null;
        
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const salt = crypto.randomBytes(SALT_LENGTH);
            const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const tag = cipher.getAuthTag();
            
            return salt.toString('hex') + ':' + iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('加密失败:', error);
            return null;
        }
    }

    /**
     * Decrypts an encrypted string
     * 
     * Expects encrypted data in format: salt:iv:tag:ciphertext
     * Returns original plaintext or the input unchanged if not encrypted.
     * 
     * @param {string|null} encryptedText - Encrypted string to decrypt
     * @returns {string|null} Decrypted plaintext, original text if not encrypted, or null on error
     */
    decrypt(encryptedText) {
        if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
        
        try {
            const parts = encryptedText.split(':');
            if (parts.length !== 4) return encryptedText;
            
            const [salt, iv, tag, encrypted] = parts.map(p => Buffer.from(p, 'hex'));
            
            const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
            decipher.setAuthTag(tag);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('解密失败:', error);
            return null;
        }
    }

    /**
     * Encrypts API keys in a configuration object
     * 
     * Iterates through all providers and encrypts their API keys.
     * Creates a deep copy to avoid modifying the original.
     * 
     * @param {DecryptedConfig} config - Configuration with plaintext API keys
     * @returns {EncryptedConfig} Configuration with encrypted API keys
     */
    encryptConfig(config) {
        if (!config || !config.provider) return config;
        
        const encrypted = JSON.parse(JSON.stringify(config));
        
        for (const provider of Object.values(encrypted.provider || {})) {
            if (provider.options && provider.options.apiKey) {
                provider.options.apiKey = this.encrypt(provider.options.apiKey);
            }
        }
        
        return encrypted;
    }

    /**
     * Decrypts API keys in a configuration object
     * 
     * Iterates through all providers and decrypts their API keys.
     * Creates a deep copy to avoid modifying the original.
     * 
     * @param {EncryptedConfig} config - Configuration with encrypted API keys
     * @returns {DecryptedConfig} Configuration with decrypted API keys
     */
    decryptConfig(config) {
        if (!config || !config.provider) return config;
        
        const decrypted = JSON.parse(JSON.stringify(config));
        
        for (const provider of Object.values(decrypted.provider || {})) {
            if (provider.options && provider.options.apiKey) {
                const decryptedKey = this.decrypt(provider.options.apiKey);
                if (decryptedKey) {
                    provider.options.apiKey = decryptedKey;
                }
            }
        }
        
        return decrypted;
    }
}

module.exports = new EncryptionService();
