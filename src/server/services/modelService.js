/**
 * Model Service Module
 *
 * Provides functionality for discovering and testing AI models from
 * OpenAI-compatible API endpoints. Handles HTTP/HTTPS requests,
 * URL normalization, and response parsing.
 *
 * @module services/modelService
 */

const http = require('http');
const https = require('https');
const Logger = require('../utils/logger');

const logger = new Logger();

/**
 * Model information object
 * @typedef {Object} ModelInfo
 * @property {string} name - Name/ID of the model
 */

/**
 * Map of model IDs to model information
 * @typedef {Object.<string, ModelInfo>} ModelsMap
 */

/**
 * Connection test result
 * @typedef {Object} TestResult
 * @property {boolean} success - Whether the test was successful
 * @property {string} [message] - Success message or response content
 * @property {string} [error] - Error message if test failed
 * @property {string} model - Model ID that was tested
 * @property {number} [latency] - Response latency in milliseconds
 * @property {string} [provider] - Provider ID (when testing all providers)
 */

/**
 * HTTP request options
 * @typedef {Object} RequestOptions
 * @property {string} method - HTTP method
 * @property {Object.<string, string>} headers - HTTP headers
 * @property {number} [headers.Content-Length] - Content length for POST requests
 */

/**
 * Service for discovering and testing AI models
 *
 * Provides methods to discover available models from API endpoints
 * and test connectivity to specific models.
 *
 * @class ModelService
 */
class ModelService {
  /**
   * Normalizes a base URL by adding/removing version paths and endpoints
   *
   * Handles various URL formats and ensures proper endpoint construction.
   * Removes trailing slashes and handles version path conflicts.
   *
   * @param {string} baseURL - Base URL to normalize
   * @param {string} [endpoint=''] - Endpoint to append
   * @returns {string} Normalized URL
   */
  normalizeURL(baseURL, endpoint = '') {
    let normalized = baseURL.trim();

    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    if (endpoint && !normalized.endsWith(endpoint)) {
      const hasVersionPath = /\/v\d+$/.test(normalized);

      if (hasVersionPath && endpoint.startsWith('/v')) {
        return normalized + endpoint.replace(/^\/v\d+/, '');
      }

      return normalized + endpoint;
    }

    return normalized;
  }

  /**
   * Builds HTTP request options with authentication
   *
   * @param {string} apiKey - API key for authentication
   * @param {string} [method='GET'] - HTTP method
   * @param {string|null} [payload=null] - Request body for POST requests
   * @returns {RequestOptions} Request options object
   */
  buildRequestOptions(apiKey, method = 'GET', payload = null) {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    return options;
  }

  /**
   * Discovers available models from an API endpoint
   *
   * Attempts to fetch models from multiple standard endpoints (/v1/models, /models)
   * and returns the first successful result.
   *
   * @param {string} baseURL - Base URL of the API
   * @param {string} apiKey - API key for authentication
   * @returns {Promise<ModelsMap>} Promise resolving to map of discovered models
   * @throws {Error} If all endpoints fail
   */
  async discoverModels(baseURL, apiKey) {
    logger.info('开始探查模型', { baseURL });

    const endpoints = ['/v1/models', '/models'];

    for (const endpoint of endpoints) {
      try {
        const models = await this.tryEndpoint(baseURL, apiKey, endpoint);
        logger.info('探查成功', { endpoint, count: Object.keys(models).length });
        return models;
      } catch (error) {
        logger.info(`端点 ${endpoint} 失败`, { error: error.message });
      }
    }

    throw new Error('无法探查模型，已尝试: ' + endpoints.join(', '));
  }

  /**
   * Attempts to fetch models from a specific endpoint
   *
   * @param {string} baseURL - Base URL of the API
   * @param {string} apiKey - API key for authentication
   * @param {string} endpoint - Endpoint path to try
   * @returns {Promise<ModelsMap>} Promise resolving to map of models
   */
  tryEndpoint(baseURL, apiKey, endpoint) {
    return new Promise((resolve, reject) => {
      const url = this.normalizeURL(baseURL, endpoint);
      const client = url.startsWith('https') ? https : http;
      const options = this.buildRequestOptions(apiKey);

      logger.info('发送请求', { url });

      client
        .get(url, options, (res) => {
          let data = '';

          res.on('data', (chunk) => (data += chunk));

          res.on('end', () => {
            try {
              if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
              }

              const parsed = JSON.parse(data);
              const models = this.parseModels(parsed);

              if (Object.keys(models).length === 0) {
                reject(new Error('未找到模型'));
                return;
              }

              resolve(models);
            } catch (error) {
              reject(new Error('解析失败: ' + error.message));
            }
          });
        })
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Parses model data from API response
   *
   * Handles various response formats from different API providers.
   *
   * @param {Object|Array} data - Raw API response data
   * @returns {ModelsMap} Parsed map of models
   */
  parseModels(data) {
    const models = {};
    const list = data.data || (Array.isArray(data) ? data : []);

    list.forEach((model) => {
      const id = model.id || model.name;
      if (id) {
        models[id] = { name: id };
      }
    });

    return models;
  }

  /**
   * Tests connection to a specific model
   *
   * Sends a minimal chat completion request to verify the model
   * is accessible and responding correctly.
   *
   * @param {string} baseURL - Base URL of the API
   * @param {string} apiKey - API key for authentication
   * @param {string} modelId - ID of the model to test
   * @returns {Promise<TestResult>} Promise resolving to test result
   */
  async testConnection(baseURL, apiKey, modelId) {
    const errors = [];
    if (!baseURL) errors.push('缺少 Base URL');
    if (!apiKey) errors.push('缺少 API Key');
    if (!modelId) errors.push('缺少模型 ID');

    if (errors.length > 0) {
      return { success: false, error: errors.join(', '), model: modelId };
    }

    logger.info('测试模型连接', { baseURL, modelId });

    return new Promise((resolve) => {
      const url = this.normalizeURL(baseURL, '/v1/chat/completions');
      const client = url.startsWith('https') ? https : http;

      const payload = JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
        stream: false,
      });

      const options = this.buildRequestOptions(apiKey, 'POST', payload);
      const startTime = Date.now();

      const req = client.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => (data += chunk));

        res.on('end', () => {
          const latency = Date.now() - startTime;

          try {
            if (res.statusCode !== 200) {
              resolve({
                success: false,
                error: `HTTP ${res.statusCode}`,
                model: modelId,
                latency,
              });
              return;
            }

            let parsed;
            try {
              parsed = JSON.parse(data);
            } catch (e) {
              // 尝试解析 SSE 格式 (有些 Provider 强制流式返回)
              const lines = data.split('\n');
              for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                  const jsonStr = line.trim().substring(6);
                  if (jsonStr.trim() === '[DONE]') continue;
                  try {
                    parsed = JSON.parse(jsonStr);
                    break;
                  } catch (inner) {
                    // 忽略单个解析错误，继续尝试下一行
                  }
                }
              }
              if (!parsed) throw e;
            }

            const content = this.extractContent(parsed);

            resolve({
              success: true,
              message: content || '连接成功',
              model: modelId,
              latency,
            });
          } catch (error) {
            resolve({
              success: false,
              error: '解析失败: ' + error.message,
              model: modelId,
              latency,
            });
          }
        });
      });

      req.on('error', (error) => {
        const latency = Date.now() - startTime;
        resolve({
          success: false,
          error: '请求失败: ' + error.message,
          model: modelId,
          latency,
        });
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Extracts content from API response
   *
   * Handles various response formats from different providers.
   *
   * @param {Object} data - API response data
   * @returns {string|null} Extracted content or null
   */
  extractContent(data) {
    if (data.choices?.[0]) {
      const choice = data.choices[0];
      return (
        choice.message?.content ||
        choice.text ||
        choice.delta?.content ||
        JSON.stringify(choice.message)
      );
    }
    return data.response || data.output || data.result || null;
  }
}

module.exports = new ModelService();
