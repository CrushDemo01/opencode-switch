/**
 * API Service Module
 *
 * Provides functions for communicating with the backend server.
 * Includes methods for configuration management, model discovery, and testing.
 *
 * @module utils/api
 */
const API = {
    async getConfig() {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('获取配置失败');
        return response.json();
    },

    async saveProvider(providerId, config) {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ providerId, config })
        });
        if (!response.ok) throw new Error('保存失败');
        return response.json();
    },

    async deleteProvider(id) {
        const response = await fetch('/api/config/' + id, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('删除失败');
        return response.json();
    },

    async discoverModels(baseURL, apiKey) {
        const response = await fetch('/api/discover-models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ baseURL, apiKey })
        });
        if (!response.ok) throw new Error('探查失败');
        return response.json();
    },

    async testModel(baseURL, apiKey, modelId) {
        const response = await fetch('/api/test-model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ baseURL, apiKey, modelId })
        });
        if (!response.ok) throw new Error('测试失败');
        return response.json();
    },

    async exportConfig() {
        const config = await this.getConfig();
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `opencode-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    async importConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    
                    if (!config.provider || typeof config.provider !== 'object') {
                        throw new Error('无效的配置文件格式');
                    }

                    let successCount = 0;
                    for (const [id, providerConfig] of Object.entries(config.provider)) {
                        const result = await this.saveProvider(id, providerConfig);
                        if (result.success) successCount++;
                    }

                    resolve({ success: true, count: successCount });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsText(file);
        });
    }
};

if (typeof window !== 'undefined') {
    window.API = API;
}
