/**
 * UI Component Module
 *
 * Provides UI utility functions for displaying messages, modals, and rendering
 * provider cards with proper XSS protection.
 *
 * @module components/ui
 */
const UI = {
    showMessage(message, type = 'info', duration = 3000) {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        msg.textContent = message;
        
        container.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, duration);
    },

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${EscapeUtils.escapeHtml(title)}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
        return modal;
    },

    renderProviderCard(id, provider) {
        const modelCount = Object.keys(provider.models || {}).length;
        const modelNames = Object.keys(provider.models || {}).join(', ') || '无';
        const options = provider.options || {};
        const apiKey = options.apiKey || '';
        const name = EscapeUtils.escapeHtml(provider.name || id);
        
        return `
            <div class="provider-card" data-id="${EscapeUtils.escapeHtml(id)}">
                <div class="provider-header">
                    <div>
                        <span class="provider-name">${name}</span>
                        <span class="models-badge">${modelCount} 个模型</span>
                    </div>
                    <div class="actions">
                        <button class="btn btn-test" data-action="test">⚡ 测试</button>
                        <button class="btn btn-edit" data-action="edit">✏️ 编辑</button>
                        <button class="btn btn-delete" data-action="delete">🗑️ 删除</button>
                    </div>
                </div>
                <div class="provider-info">
                    <span>ID: ${EscapeUtils.escapeHtml(id)}</span>
                    <span>Base URL: ${EscapeUtils.escapeHtml(options.baseURL || '未设置')}</span>
                    <span>API Key: ${apiKey ? EscapeUtils.escapeHtml(apiKey.substring(0, 20)) + '...' : '未设置'}</span>
                    ${modelCount > 0 ? `<span>模型: ${EscapeUtils.escapeHtml(modelNames)}</span>` : ''}
                </div>
            </div>
        `;
    },

    renderTemplateSelector() {
        const templates = Object.entries(ProviderTemplates).map(([key, template]) => `
            <div class="template-item" data-template="${key}">
                <strong>${EscapeUtils.escapeHtml(template.name)}</strong>
                <small>${EscapeUtils.escapeHtml(template.description)}</small>
            </div>
        `).join('');

        return `
            <div class="template-selector">
                <h4>选择 Provider 模板</h4>
                <div class="template-list">
                    ${templates}
                </div>
                <button class="btn btn-secondary" data-action="custom">自定义配置</button>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.UI = UI;
}
