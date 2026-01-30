/**
 * Main Application Module
 *
 * Client-side application for managing OpenCode AI Provider configurations.
 * Handles UI interactions, API communication, model discovery, and configuration
 * management through a web interface.
 *
 * @module app
 */

/**
 * Provider configuration object
 * @typedef {Object} ProviderConfig
 * @property {string} npm - NPM package name (e.g., '@ai-sdk/openai-compatible')
 * @property {string} name - Display name of the provider
 * @property {ProviderOptions} options - Provider connection options
 * @property {Object.<string, ModelInfo>} models - Map of configured models
 */

/**
 * Provider connection options
 * @typedef {Object} ProviderOptions
 * @property {string} baseURL - Base URL for API requests
 * @property {string} apiKey - API key for authentication
 */

/**
 * Model information object
 * @typedef {Object} ModelInfo
 * @property {string} name - Name/ID of the model
 */

/**
 * Complete configuration object
 * @typedef {Object} AppConfig
 * @property {Object.<string, ProviderConfig>} provider - Map of provider configurations
 */

/**
 * Model discovery result
 * @typedef {Object} DiscoveryResult
 * @property {Object.<string, ModelInfo>} models - Discovered models
 * @property {string} [error] - Error message if discovery failed
 */

/**
 * Connection test result
 * @typedef {Object} ConnectionTestResult
 * @property {boolean} success - Whether the test was successful
 * @property {string} [message] - Success message
 * @property {string} [error] - Error message if test failed
 * @property {string} model - Model ID that was tested
 * @property {number} [latency] - Response latency in milliseconds
 * @property {string} [provider] - Provider ID (when testing all)
 */

/**
 * API save response
 * @typedef {Object} SaveResponse
 * @property {boolean} success - Whether the save was successful
 * @property {string} [error] - Error message if save failed
 */

/**
 * Import result
 * @typedef {Object} ImportResult
 * @property {number} count - Number of providers imported
 */

/**
 * Main application object
 *
 * Manages the entire client-side application state and behavior.
 * Handles form submissions, model discovery, testing, and UI updates.
 *
 * @namespace App
 * @property {AppConfig} config - Current application configuration
 * @property {Object.<string, ModelInfo>} discoveredModels - Models discovered from API
 * @property {Set<string>} selectedModels - Currently selected model IDs
 */
const App = {
  /** @type {AppConfig} */
  config: { provider: {} },

  /** @type {Object.<string, ModelInfo>} */
  discoveredModels: {},

  /** @type {Set<string>} */
  selectedModels: new Set(),

  /**
   * Initializes the application
   *
   * Binds event handlers, initializes provider templates, and loads
   * the current configuration from the server.
   *
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    this.bindEvents();
    this.initTemplates();
    await this.loadConfig();
  },

  /**
   * Initializes provider template dropdown
   *
   * Populates the template select element with available provider templates
   * and sets up the change event handler to auto-fill form fields.
   */
  initTemplates() {
    const select = document.getElementById('templateSelect');
    Object.entries(ProviderTemplates).forEach(([key, template]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = template.name;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      const template = ProviderTemplates[e.target.value];
      if (template) {
        document.getElementById('baseURL').value = template.baseURL;
        document.getElementById('providerName').value = template.name;
      }
    });
  },

  /**
   * Binds event handlers to UI elements
   *
   * Sets up all event listeners for forms, buttons, and the providers list.
   */
  bindEvents() {
    document.getElementById('providerForm').addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('discoverBtn').addEventListener('click', () => this.discoverModels());
    document.getElementById('manualAddBtn').addEventListener('click', () => this.showManualAdd());
    document
      .getElementById('confirmModelsBtn')
      .addEventListener('click', () => this.confirmModels());
    document
      .getElementById('addManualModelsBtn')
      .addEventListener('click', () => this.addManualModels());
    document.getElementById('testAllBtn').addEventListener('click', () => this.testAll());
    document.getElementById('exportBtn').addEventListener('click', () => API.exportConfig());
    document.getElementById('importBtn').addEventListener('change', (e) => this.importConfig(e));
    document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());

    document.getElementById('providersList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const card = e.target.closest('.provider-card');
      if (!card) return;

      const id = card.dataset.id;
      const action = btn.dataset.action;

      switch (action) {
        case 'test':
          this.testProvider(id);
          break;
        case 'edit':
          this.editProvider(id);
          break;
        case 'delete':
          this.deleteProvider(id);
          break;
      }
    });
  },

  /**
   * Loads configuration from the server
   *
   * Fetches current configuration and renders the providers list.
   *
   * @async
   * @returns {Promise<void>}
   */
  async loadConfig() {
    try {
      this.config = await API.getConfig();
      this.renderProviders();
      UI.showMessage('配置加载成功', 'success');
    } catch (error) {
      UI.showMessage('加载配置失败: ' + error.message, 'error');
    }
  },

  /**
   * Renders the providers list in the UI
   *
   * Displays all configured providers as cards with edit/delete buttons.
   */
  renderProviders() {
    const container = document.getElementById('providersList');
    const providers = this.config.provider || {};

    if (Object.keys(providers).length === 0) {
      container.innerHTML = '<p class="empty">暂无配置的 Provider</p>';
      return;
    }

    container.innerHTML = Object.entries(providers)
      .map(([id, provider]) => UI.renderProviderCard(id, provider))
      .join('');
  },

  /**
   * Handles provider form submission
   *
   * Validates form data, constructs provider config, and saves to server.
   *
   * @async
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   */
  async handleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('providerId').value.trim();
    const isEdit = document.getElementById('isEditMode').value === 'true';

    const config = {
      npm: '@ai-sdk/openai-compatible',
      name: document.getElementById('providerName').value.trim() || id,
      options: {
        baseURL: document.getElementById('baseURL').value.trim(),
        apiKey: document.getElementById('apiKey').value.trim(),
      },
      models: JSON.parse(document.getElementById('existingModels').value || '{}'),
    };

    try {
      const result = await API.saveProvider(id, config);
      if (result.success) {
        ConfigHistory.save(this.config);
        UI.showMessage(isEdit ? '更新成功' : '添加成功', 'success');
        await this.loadConfig();
        this.resetForm();
      } else {
        UI.showMessage('保存失败', 'error');
      }
    } catch (error) {
      UI.showMessage('保存失败: ' + error.message, 'error');
    }
  },

  /**
   * Discovers available models from the provider API
   *
   * Validates form fields, calls the discovery API, and displays results.
   *
   * @async
   * @returns {Promise<void>}
   */
  async discoverModels() {
    const baseURL = document.getElementById('baseURL').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!baseURL || !apiKey) {
      UI.showMessage('请填写 Base URL 和 API Key', 'warning');
      return;
    }

    UI.showMessage('正在探查模型...', 'info');

    try {
      const result = await API.discoverModels(baseURL, apiKey);

      if (result.error) {
        UI.showMessage('探查失败: ' + result.error, 'error');
        return;
      }

      this.discoveredModels = result.models || {};
      this.showModelsSelection();
      UI.showMessage(`发现 ${Object.keys(this.discoveredModels).length} 个模型`, 'success');
    } catch (error) {
      UI.showMessage('探查失败: ' + error.message, 'error');
    }
  },

  /**
   * Displays discovered models for selection
   *
   * Renders checkboxes for each discovered model and shows the selection panel.
   */
  showModelsSelection() {
    const container = document.getElementById('modelsList');
    const section = document.getElementById('modelsSelection');

    const models = Object.entries(this.discoveredModels)
      .map(
        ([id, info]) => `
            <div class="model-item">
                <input type="checkbox" id="model-${EscapeUtils.escapeHtml(id)}" 
                       value="${EscapeUtils.escapeHtml(id)}" class="model-checkbox">
                <label for="model-${EscapeUtils.escapeHtml(id)}">${EscapeUtils.escapeHtml(id)}</label>
            </div>
        `
      )
      .join('');

    container.innerHTML = models;
    section.style.display = 'block';
    document.getElementById('manualModelsSection').style.display = 'none';

    container.querySelectorAll('.model-checkbox').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.selectedModels.add(e.target.value);
        } else {
          this.selectedModels.delete(e.target.value);
        }
      });
    });
  },

  /**
   * Shows the manual model addition section
   *
   * Hides the discovery results and shows the manual input textarea.
   */
  showManualAdd() {
    document.getElementById('modelsSelection').style.display = 'none';
    document.getElementById('manualModelsSection').style.display = 'block';
  },

  /**
   * Confirms selected models from discovery
   *
   * Adds selected models to the existing models list and updates the form.
   */
  confirmModels() {
    const existing = JSON.parse(document.getElementById('existingModels').value || '{}');

    this.selectedModels.forEach((id) => {
      existing[id] = { name: id };
    });

    document.getElementById('existingModels').value = JSON.stringify(existing);
    document.getElementById('modelsSelection').style.display = 'none';
    this.selectedModels.clear();

    UI.showMessage(`已选择 ${Object.keys(existing).length} 个模型`, 'success');
  },

  /**
   * Adds manually entered models
   *
   * Parses the manual input textarea and adds each model ID to the config.
   */
  addManualModels() {
    const input = document.getElementById('manualModelsInput').value.trim();
    if (!input) {
      UI.showMessage('请输入模型 ID', 'warning');
      return;
    }

    const existing = JSON.parse(document.getElementById('existingModels').value || '{}');
    const newIds = input
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l);

    newIds.forEach((id) => {
      existing[id] = { name: id };
    });

    document.getElementById('existingModels').value = JSON.stringify(existing);
    document.getElementById('manualModelsInput').value = '';
    document.getElementById('manualModelsSection').style.display = 'none';

    UI.showMessage(`已添加 ${newIds.length} 个模型`, 'success');
  },

  /**
   * Tests connection for a specific provider's models
   *
   * Opens test modal and runs connection tests for all models of the provider.
   *
   * @async
   * @param {string} id - Provider ID to test
   * @returns {Promise<void>}
   */
  async testProvider(id) {
    const provider = this.config.provider[id];
    if (!provider?.models) {
      UI.showMessage('Provider 没有配置模型', 'warning');
      return;
    }

    const options = provider.options || {};
    if (!options.baseURL || !options.apiKey) {
      UI.showMessage('Provider 配置不完整', 'warning');
      return;
    }

    const modelIds = Object.keys(provider.models);
    if (modelIds.length === 0) {
      UI.showMessage('没有模型需要测试', 'warning');
      return;
    }

    this.showTestModal();
    this.updateTestProgress(`准备测试 ${modelIds.length} 个模型...`);

    const results = [];
    const promises = modelIds.map(async (modelId) => {
      try {
        const result = await API.testModel(options.baseURL, options.apiKey, modelId);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          model: modelId,
        });
      }
      this.updateTestProgress(`测试中... (${results.length}/${modelIds.length})`);
      this.renderTestResults(results);
    });

    await Promise.all(promises);
    this.updateTestProgress('测试完成');
  },

  /**
   * Tests connections for all configured providers
   *
   * Opens test modal and runs connection tests for all models across all providers.
   *
   * @async
   * @returns {Promise<void>}
   */
  async testAll() {
    const providers = Object.entries(this.config.provider || {});
    if (providers.length === 0) {
      UI.showMessage('没有 Provider 需要测试', 'warning');
      return;
    }

    this.showTestModal();

    const tasks = [];
    for (const [id, provider] of providers) {
      const options = provider.options || {};
      if (!options.baseURL || !options.apiKey || !provider.models) {
        continue;
      }
      for (const modelId of Object.keys(provider.models)) {
        tasks.push({ providerId: id, modelId, options });
      }
    }

    if (tasks.length === 0) {
      this.updateTestProgress('没有找到可测试的模型');
      return;
    }

    this.updateTestProgress(`准备测试 ${tasks.length} 个模型...`);
    const results = [];

    const promises = tasks.map(async (task) => {
      try {
        const result = await API.testModel(task.options.baseURL, task.options.apiKey, task.modelId);
        results.push({ ...result, provider: task.providerId });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          model: task.modelId,
          provider: task.providerId,
        });
      }
      this.updateTestProgress(`测试中... (${results.length}/${tasks.length})`);
      this.renderTestResults(results);
    });

    await Promise.all(promises);
    this.updateTestProgress(`测试完成，共 ${results.length} 个模型`);
  },

  /**
   * Displays the test results modal
   *
   * Opens the modal dialog and initializes close button handler.
   */
  showTestModal() {
    const modal = document.getElementById('testModal');
    modal.style.display = 'flex';
    document.getElementById('testProgress').textContent = '';
    document.getElementById('testResults').innerHTML = '';

    modal.querySelector('.close-btn').onclick = () => {
      modal.style.display = 'none';
    };
  },

  /**
   * Updates the test progress text
   *
   * @param {string} text - Progress message to display
   */
  updateTestProgress(text) {
    document.getElementById('testProgress').textContent = text;
  },

  /**
   * Renders test results in the modal
   *
   * @param {ConnectionTestResult[]} results - Array of test results
   */
  renderTestResults(results) {
    const container = document.getElementById('testResults');
    container.innerHTML = results
      .map(
        (r) => `
            <div class="test-result ${r.success ? 'success' : 'error'}">
                <strong>${EscapeUtils.escapeHtml(r.model)}</strong>
                ${r.provider ? `<span>(${EscapeUtils.escapeHtml(r.provider)})</span>` : ''}
                <span class="badge ${r.success ? 'success' : 'error'}">
                    ${r.success ? '✓' : '✗'}
                </span>
                ${r.latency ? `<span>${r.latency}ms</span>` : ''}
                ${r.error ? `<div class="error-msg">${EscapeUtils.escapeHtml(r.error)}</div>` : ''}
            </div>
        `
      )
      .join('');
  },

  /**
   * Opens provider editor with existing configuration
   *
   * Populates the form fields with the provider's current settings.
   *
   * @param {string} id - Provider ID to edit
   */
  editProvider(id) {
    const provider = this.config.provider[id];
    if (!provider) return;

    const options = provider.options || {};

    document.getElementById('providerId').value = id;
    document.getElementById('providerName').value = provider.name || '';
    document.getElementById('baseURL').value = options.baseURL || '';
    document.getElementById('apiKey').value = options.apiKey || '';
    document.getElementById('existingModels').value = JSON.stringify(provider.models || {});
    document.getElementById('isEditMode').value = 'true';
    document.getElementById('formTitle').textContent = '✏️ 编辑 Provider';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Deletes a provider configuration
   *
   * Confirms with user, then sends delete request to server.
   *
   * @async
   * @param {string} id - Provider ID to delete
   * @returns {Promise<void>}
   */
  async deleteProvider(id) {
    if (!confirm(`确定要删除 Provider "${id}" 吗？`)) return;

    try {
      const result = await API.deleteProvider(id);
      if (result.success) {
        ConfigHistory.save(this.config);
        UI.showMessage('删除成功', 'success');
        await this.loadConfig();
      } else {
        UI.showMessage('删除失败: ' + result.error, 'error');
      }
    } catch (error) {
      UI.showMessage('删除失败: ' + error.message, 'error');
    }
  },

  /**
   * Imports configuration from a file
   *
   * Reads the selected file and sends to server for import.
   *
   * @async
   * @param {Event} e - File input change event
   * @returns {Promise<void>}
   */
  async importConfig(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await API.importConfig(file);
      UI.showMessage(`成功导入 ${result.count} 个 Provider`, 'success');
      await this.loadConfig();
    } catch (error) {
      UI.showMessage('导入失败: ' + error.message, 'error');
    }

    e.target.value = '';
  },

  /**
   * Displays configuration history modal
   *
   * Shows previous configuration states and allows restoration.
   */
  showHistory() {
    const content = ConfigHistory.renderHistoryList();
    const modal = UI.createModal(
      '配置历史',
      `
            <div class="history-list">
                ${content}
            </div>
        `
    );

    modal.querySelectorAll('[data-action="restore"]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const item = e.target.closest('.history-item');
        const timestamp = parseInt(item.dataset.timestamp);
        const config = ConfigHistory.restore(timestamp);

        if (config && confirm('确定要恢复到这个时间点的配置吗？')) {
          try {
            for (const [id, providerConfig] of Object.entries(config.provider || {})) {
              await API.saveProvider(id, providerConfig);
            }
            UI.showMessage('配置已恢复', 'success');
            await this.loadConfig();
            modal.remove();
          } catch (error) {
            UI.showMessage('恢复失败: ' + error.message, 'error');
          }
        }
      });
    });
  },

  /**
   * Resets the provider form to default state
   *
   * Clears all form fields, resets edit mode, and hides model selection panels.
   */
  resetForm() {
    document.getElementById('providerForm').reset();
    document.getElementById('existingModels').value = '{}';
    document.getElementById('isEditMode').value = 'false';
    document.getElementById('formTitle').textContent = '➕ 添加 Provider';
    document.getElementById('modelsSelection').style.display = 'none';
    document.getElementById('manualModelsSection').style.display = 'none';
    this.selectedModels.clear();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
