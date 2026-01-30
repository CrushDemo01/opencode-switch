/**
 * Input Validation Utility
 *
 * Provides validation functions for provider configurations, URLs, API keys,
 * and model identifiers. Ensures data integrity and security by validating
 * all user inputs before processing.
 *
 * @module utils/validator
 */
const Validator = {
  /**
   * 验证 Provider ID
   * @param {string} id - Provider ID
   * @returns {boolean}
   */
  isValidProviderId(id) {
    if (!id || typeof id !== 'string') return false;
    // 允许中文、英文、数字、下划线、连字符
    return /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(id) && id.length >= 1 && id.length <= 64;
  },

  /**
   * 验证 Base URL
   * @param {string} url - URL
   * @returns {boolean}
   */
  isValidBaseURL(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },

  /**
   * 验证 API Key
   * @param {string} key - API Key
   * @returns {boolean}
   */
  isValidApiKey(key) {
    if (!key || typeof key !== 'string') return false;
    return key.length >= 1 && key.length <= 2048;
  },

  /**
   * 验证模型 ID
   * @param {string} modelId - 模型 ID
   * @returns {boolean}
   */
  isValidModelId(modelId) {
    if (!modelId || typeof modelId !== 'string') return false;
    return modelId.length >= 1 && modelId.length <= 256;
  },

  /**
   * 验证 Provider 配置对象
   * @param {Object} config - 配置对象
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateProviderConfig(config) {
    const errors = [];

    if (!config || typeof config !== 'object') {
      return { valid: false, errors: ['配置必须是对象'] };
    }

    // 验证 ID
    if (!this.isValidProviderId(config.providerId)) {
      errors.push('Provider ID 只能包含字母、数字、下划线和连字符，长度1-64字符');
    }

    // 验证 name（如果提供）
    if (config.name && (typeof config.name !== 'string' || config.name.length > 128)) {
      errors.push('Provider 名称不能超过128字符');
    }

    // 验证 options
    if (config.options) {
      if (typeof config.options !== 'object') {
        errors.push('options 必须是对象');
      } else {
        if (config.options.baseURL && !this.isValidBaseURL(config.options.baseURL)) {
          errors.push('Base URL 格式无效，必须是有效的 http/https URL');
        }
        if (config.options.apiKey && !this.isValidApiKey(config.options.apiKey)) {
          errors.push('API Key 长度无效（1-2048字符）');
        }
      }
    }

    // 验证 models
    if (config.models) {
      if (typeof config.models !== 'object') {
        errors.push('models 必须是对象');
      } else {
        for (const [modelId, modelConfig] of Object.entries(config.models)) {
          if (!this.isValidModelId(modelId)) {
            errors.push(`模型 ID "${modelId}" 无效（长度1-256字符）`);
          }
          if (modelConfig && typeof modelConfig !== 'object') {
            errors.push(`模型 "${modelId}" 的配置必须是对象`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * 清理字符串输入
   * @param {string} str - 输入字符串
   * @param {number} maxLength - 最大长度
   * @returns {string}
   */
  sanitizeString(str, maxLength = 256) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength);
  },
};

module.exports = Validator;
