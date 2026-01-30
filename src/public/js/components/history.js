/**
 * Configuration History Module
 *
 * Manages local storage of configuration history for rollback functionality.
 * Stores up to 20 historical snapshots with timestamps.
 *
 * @module components/history
 */
const ConfigHistory = {
    STORAGE_KEY: 'opencode_config_history',
    MAX_HISTORY: 20,

    save(config) {
        try {
            const history = this.getHistory();
            const entry = {
                timestamp: Date.now(),
                date: new Date().toISOString(),
                config: JSON.parse(JSON.stringify(config))
            };

            history.unshift(entry);
            
            if (history.length > this.MAX_HISTORY) {
                history.pop();
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error('保存历史失败:', e);
        }
    },

    getHistory() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    restore(timestamp) {
        const history = this.getHistory();
        const entry = history.find(h => h.timestamp === timestamp);
        return entry ? entry.config : null;
    },

    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    renderHistoryList() {
        const history = this.getHistory();
        
        if (history.length === 0) {
            return '<p class="empty">暂无历史记录</p>';
        }

        return history.map(entry => {
            const date = new Date(entry.date).toLocaleString();
            const providerCount = Object.keys(entry.config.provider || {}).length;
            
            return `
                <div class="history-item" data-timestamp="${entry.timestamp}">
                    <div class="history-info">
                        <strong>${date}</strong>
                        <span>${providerCount} 个 Provider</span>
                    </div>
                    <button class="btn btn-restore" data-action="restore">恢复</button>
                </div>
            `;
        }).join('');
    }
};

if (typeof window !== 'undefined') {
    window.ConfigHistory = ConfigHistory;
}
