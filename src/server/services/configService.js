/**
 * Configuration Service Module
 * 
 * Manages OpenCode configuration file operations including reading, writing,
 * and provider management. Implements caching for performance optimization
 * and integrates with encryption service for secure API key storage.
 * 
 * @module services/configService
 */

const fs = require('fs');
const path = require('path');
const encryptionService = require('./encryptionService');
const Logger = require('../utils/logger');

const logger = new Logger();

/**
 * Provider configuration object
 * @typedef {Object} ProviderConfig
 * @property {string} npm - NPM package name for the provider
 * @property {string} name - Display name of the provider
 * @property {Object} options - Provider options
 * @property {string} options.baseURL - Base URL for API requests
 * @property {string} options.apiKey - API key (encrypted when stored)
 * @property {Object.<string, ModelConfig>} models - Map of model configurations
 */

/**
 * Model configuration object
 * @typedef {Object} ModelConfig
 * @property {string} name - Name/ID of the model
 */

/**
 * Complete configuration object structure
 * @typedef {Object} Config
 * @property {Object.<string, ProviderConfig>} provider - Map of provider configurations
 */

/**
 * Service for managing OpenCode configuration files
 * 
 * Handles all configuration-related operations including file I/O,
 * caching, and encryption/decryption of sensitive data.
 * 
 * @class ConfigService
 */
class ConfigService {
    /**
     * Creates a new ConfigService instance
     * 
     * Initializes the service with configuration path from command line arguments,
     * environment variable, or default location. Sets up caching mechanism.
     */
    constructor() {
        const args = process.argv.slice(2);
        const configPathArg = args.find(arg => arg.startsWith('--config='));
        this.configPath = configPathArg
            ? configPathArg.replace('--config=', '')
            : process.env.OPENCODE_CONFIG_PATH || path.join(process.env.HOME || process.env.USERPROFILE, '.config/opencode/opencode.json');
        
        /** @type {Config|null} */
        this.cache = null;
        
        /** @type {number} */
        this.lastRead = 0;
        
        /** @type {number} */
        this.cacheTTL = 5000;
    }

    /**
     * Reads the configuration file
     * 
     * Returns cached configuration if available and valid, otherwise
     * reads from disk, decrypts sensitive data, and updates cache.
     * 
     * @param {boolean} [useCache=true] - Whether to use cached configuration
     * @returns {Config} The configuration object (empty provider object if file doesn't exist or on error)
     */
    readConfig(useCache = true) {
        const now = Date.now();
        
        if (useCache && this.cache && (now - this.lastRead) < this.cacheTTL) {
            return JSON.parse(JSON.stringify(this.cache));
        }

        try {
            if (!fs.existsSync(this.configPath)) {
                logger.info('配置文件不存在，使用默认配置', { path: this.configPath });
                return { provider: {} };
            }

            const content = fs.readFileSync(this.configPath, 'utf-8');
            const parsed = JSON.parse(content);
            
            const decrypted = encryptionService.decryptConfig(parsed);
            
            this.cache = decrypted;
            this.lastRead = now;
            
            logger.debug('读取配置文件成功', { path: this.configPath });
            return JSON.parse(JSON.stringify(decrypted));
        } catch (error) {
            logger.error('读取配置文件失败', { error: error.message, path: this.configPath });
            return { provider: {} };
        }
    }

    /**
     * Writes configuration to file
     * 
     * Encrypts sensitive data, ensures directory exists, writes to file,
     * and updates the cache.
     * 
     * @param {Config} config - Configuration object to write
     * @returns {boolean} True if write was successful, false otherwise
     */
    writeConfig(config) {
        try {
            const dir = path.dirname(this.configPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const encrypted = encryptionService.encryptConfig(config);
            const content = JSON.stringify(encrypted, null, 2);
            
            fs.writeFileSync(this.configPath, content, 'utf-8');
            
            this.cache = JSON.parse(JSON.stringify(config));
            this.lastRead = Date.now();
            
            logger.info('配置文件写入成功', { path: this.configPath });
            return true;
        } catch (error) {
            logger.error('写入配置文件失败', { error: error.message, path: this.configPath });
            return false;
        }
    }

    /**
     * Gets a specific provider configuration by ID
     * 
     * @param {string} id - Provider ID
     * @returns {ProviderConfig|null} Provider configuration or null if not found
     */
    getProvider(id) {
        const config = this.readConfig();
        return config.provider?.[id] || null;
    }

    /**
     * Adds or updates a provider configuration
     * 
     * @param {string} id - Provider ID
     * @param {ProviderConfig} providerConfig - Provider configuration object
     * @returns {boolean} True if operation was successful
     */
    addOrUpdateProvider(id, providerConfig) {
        const config = this.readConfig(false);
        
        if (!config.provider) {
            config.provider = {};
        }
        
        config.provider[id] = providerConfig;
        return this.writeConfig(config);
    }

    /**
     * Deletes a provider configuration
     * 
     * @param {string} id - Provider ID to delete
     * @returns {boolean} True if provider was deleted, false if not found
     */
    deleteProvider(id) {
        const config = this.readConfig(false);
        
        if (config.provider && config.provider[id]) {
            delete config.provider[id];
            return this.writeConfig(config);
        }
        
        return false;
    }

    /**
     * Gets all provider configurations
     * 
     * @returns {Object.<string, ProviderConfig>} Map of all provider configurations
     */
    getAllProviders() {
        const config = this.readConfig();
        return config.provider || {};
    }

    /**
     * Clears the configuration cache
     * 
     * Forces next readConfig call to read from disk.
     */
    clearCache() {
        this.cache = null;
        this.lastRead = 0;
    }
}

module.exports = new ConfigService();
