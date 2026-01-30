/**
 * Logging Service Module
 *
 * Provides a Logger class with log rotation, log levels, and colored console output.
 * Automatically rotates logs when file size exceeds the configured limit.
 *
 * @module utils/logger
 */
const fs = require('fs');
const path = require('path');

class Logger {
    constructor(options = {}) {
        this.logPath = options.logPath || path.join(__dirname, '../../../config-manager.log');
        this.maxSize = options.maxSize || 10 * 1024 * 1024; // 默认 10MB
        this.maxFiles = options.maxFiles || 5;
        this.level = options.level || 'INFO';
        
        const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
        this.levelValue = levels[this.level] || 1;
    }

    /**
     * 检查并执行日志轮转
     */
    rotate() {
        try {
            if (!fs.existsSync(this.logPath)) return;
            
            const stats = fs.statSync(this.logPath);
            if (stats.size < this.maxSize) return;

            // 轮转现有日志文件
            for (let i = this.maxFiles - 1; i > 0; i--) {
                const oldPath = `${this.logPath}.${i}`;
                const newPath = `${this.logPath}.${i + 1}`;
                
                if (fs.existsSync(oldPath)) {
                    if (i === this.maxFiles - 1) {
                        fs.unlinkSync(oldPath); // 删除最旧的
                    } else {
                        fs.renameSync(oldPath, newPath);
                    }
                }
            }

            // 重命名当前日志
            fs.renameSync(this.logPath, `${this.logPath}.1`);
        } catch (error) {
            console.error('日志轮转失败:', error);
        }
    }

    /**
     * 写入日志
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {Object} data - 附加数据
     */
    log(level, message, data = null) {
        const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
        if (levels[level] < this.levelValue) return;

        this.rotate();

        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level}] ${message}`;

        if (data) {
            try {
                logMessage += '\n' + JSON.stringify(data, null, 2);
            } catch (e) {
                logMessage += '\n[无法序列化的数据]';
            }
        }

        logMessage += '\n';

        try {
            fs.appendFileSync(this.logPath, logMessage, 'utf-8');
        } catch (error) {
            console.error('写入日志文件失败:', error);
        }

        // 控制台输出（带颜色）
        const colors = {
            DEBUG: '\x1b[36m', // 青色
            INFO: '\x1b[32m',  // 绿色
            WARN: '\x1b[33m',  // 黄色
            ERROR: '\x1b[31m', // 红色
            RESET: '\x1b[0m'
        };
        console.log(`${colors[level] || ''}[${level}]${colors.RESET} ${message}`);
    }

    debug(message, data) { this.log('DEBUG', message, data); }
    info(message, data) { this.log('INFO', message, data); }
    warn(message, data) { this.log('WARN', message, data); }
    error(message, data) { this.log('ERROR', message, data); }
}

module.exports = Logger;
