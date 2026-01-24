#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 从命令行参数或环境变量获取配置文件路径
const args = process.argv.slice(2);
const configPathArg = args.find(arg => arg.startsWith('--config='));
const CONFIG_PATH = configPathArg
    ? configPathArg.replace('--config=', '')
    : process.env.OPENCODE_CONFIG_PATH || path.join(process.env.HOME || process.env.USERPROFILE, '.config/opencode/opencode.json');

const HTML_PATH = path.join(__dirname, 'index.html');
const LOG_PATH = path.join(__dirname, 'config-manager.log');
const PORT = process.env.PORT || 3456;

// 日志函数
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
        logMessage += '\n' + JSON.stringify(data, null, 2);
    }

    logMessage += '\n';

    // 写入日志文件
    fs.appendFileSync(LOG_PATH, logMessage, 'utf-8');

    // 同时输出到控制台
    console.log(logMessage);
}

// 读取配置文件
function readConfig() {
    try {
        const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
        // 直接解析 JSON，因为文件已经是标准 JSON 格式
        return JSON.parse(content);
    } catch (error) {
        log('ERROR', '读取配置文件失败', { error: error.message });
        return { provider: {} };
    }
}

// 写入配置文件
function writeConfig(config) {
    try {
        const content = JSON.stringify(config, null, 2);
        fs.writeFileSync(CONFIG_PATH, content, 'utf-8');
        log('INFO', '配置文件写入成功');
        return true;
    } catch (error) {
        log('ERROR', '写入配置文件失败', { error: error.message });
        return false;
    }
}

// 自动探查模型
async function discoverModels(baseURL, apiKey) {
    log('INFO', '开始探查模型', { baseURL });

    return new Promise((resolve, reject) => {
        // 确保 URL 格式正确
        let url = baseURL.endsWith('/') ? baseURL + 'models' : baseURL + '/models';

        // 处理 http 和 https
        const client = url.startsWith('https') ? https : http;

        const options = {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };

        log('INFO', '发送请求', { url, headers: options.headers });

        client.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    log('INFO', 'API 响应', {
                        statusCode: res.statusCode,
                        dataPreview: data.substring(0, 200)
                    });

                    // 检查响应状态码
                    if (res.statusCode !== 200) {
                        const error = `API 返回错误状态码: ${res.statusCode}`;
                        log('ERROR', error, { fullResponse: data });
                        reject(new Error(error));
                        return;
                    }

                    const parsed = JSON.parse(data);
                    const models = {};

                    if (parsed.data && Array.isArray(parsed.data)) {
                        parsed.data.forEach(model => {
                            const modelId = model.id || model.name;
                            if (modelId) {
                                models[modelId] = {
                                    name: modelId
                                };
                            }
                        });
                    } else if (Array.isArray(parsed)) {
                        // 有些 API 直接返回数组
                        parsed.forEach(model => {
                            const modelId = model.id || model.name;
                            if (modelId) {
                                models[modelId] = {
                                    name: modelId
                                };
                            }
                        });
                    } else {
                        const error = 'API 返回格式不符合预期';
                        log('ERROR', error, { parsedData: parsed });
                        reject(new Error(error));
                        return;
                    }

                    log('INFO', '探查成功', { modelCount: Object.keys(models).length, models });
                    resolve(models);
                } catch (error) {
                    log('ERROR', '解析模型数据失败', {
                        error: error.message,
                        rawData: data.substring(0, 1000)
                    });
                    reject(new Error('解析模型数据失败: ' + error.message));
                }
            });
        }).on('error', (error) => {
            log('ERROR', '请求失败', { error: error.message });
            reject(new Error('请求失败: ' + error.message));
        });
    });
}

// 测试模型连接
async function testModelConnection(baseURL, apiKey, modelId) {
    // 参数验证
    if (!baseURL || typeof baseURL !== 'string') {
        return { success: false, error: '缺少有效的 Base URL', model: modelId };
    }
    if (!apiKey || typeof apiKey !== 'string') {
        return { success: false, error: '缺少有效的 API Key', model: modelId };
    }
    if (!modelId || typeof modelId !== 'string') {
        return { success: false, error: '缺少有效的模型 ID', model: modelId };
    }

    log('INFO', '开始测试模型连接', { baseURL, modelId });

    return new Promise((resolve, reject) => {
        // 确保 URL 格式正确
        let normalizedURL = baseURL.trim();
        // 移除末尾斜杠
        if (normalizedURL.endsWith('/')) {
            normalizedURL = normalizedURL.slice(0, -1);
        }

        // 检查是否已经包含 /v1 或其他版本路径
        const hasVersionPath = /\/v\d+$/.test(normalizedURL) || normalizedURL.endsWith('/chat/completions');

        // 构建完整 URL
        let url;
        if (normalizedURL.endsWith('/chat/completions')) {
            url = normalizedURL;
        } else if (hasVersionPath) {
            url = normalizedURL + '/chat/completions';
        } else {
            // 如果没有版本路径，添加 /v1
            url = normalizedURL + '/v1/chat/completions';
        }

        // 处理 http 和 https
        const client = url.startsWith('https') ? https : http;

        const payload = JSON.stringify({
            model: modelId,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 10
        });

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        log('INFO', '发送测试请求', { url });

        const startTime = Date.now();

        const req = client.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const endTime = Date.now();
                const latency = endTime - startTime;

                try {
                    log('INFO', '测试响应', {
                        statusCode: res.statusCode,
                        latency,
                        dataPreview: data.substring(0, 200)
                    });

                    if (res.statusCode !== 200) {
                        const error = `API 返回错误状态码: ${res.statusCode}`;
                        log('ERROR', error, { fullResponse: data });
                        resolve({
                            success: false,
                            error: error,
                            model: modelId,
                            latency
                        });
                        return;
                    }

                    const parsed = JSON.parse(data);

                    // 尝试从多种响应格式中提取内容
                    let content = null;
                    if (parsed.choices && parsed.choices.length > 0) {
                        const choice = parsed.choices[0];
                        // 标准 OpenAI 格式
                        content = choice.message?.content
                            // 某些 API 使用 text 字段
                            || choice.text
                            // 流式响应格式
                            || choice.delta?.content
                            // 如果有 message 但没有 content，尝试其他字段
                            || (choice.message && JSON.stringify(choice.message));
                    }

                    // 如果还是没有内容，尝试其他常见格式
                    if (!content && parsed.response) {
                        content = parsed.response;
                    }
                    if (!content && parsed.output) {
                        content = parsed.output;
                    }
                    if (!content && parsed.result) {
                        content = parsed.result;
                    }

                    // 简单的验证响应格式
                    if (parsed.choices && parsed.choices.length > 0) {
                        resolve({
                            success: true,
                            message: content || '连接成功 (API 未返回文本内容)',
                            model: modelId,
                            latency,
                            raw: data.substring(0, 500) // 返回原始响应用于调试
                        });
                    } else if (content) {
                        // 非标准格式但有内容
                        resolve({
                            success: true,
                            message: content,
                            model: modelId,
                            latency
                        });
                    } else {
                        resolve({
                            success: false,
                            error: 'API 返回格式不符合预期: 缺少 choices 字段',
                            model: modelId,
                            latency,
                            raw: data.substring(0, 500)
                        });
                    }
                } catch (error) {
                    resolve({
                        success: false,
                        error: '解析响应失败: ' + error.message,
                        model: modelId,
                        latency
                    });
                }
            });
        });

        req.on('error', (error) => {
            const endTime = Date.now();
            const latency = endTime - startTime;
            log('ERROR', '测试请求失败', { error: error.message });
            resolve({
                success: false,
                error: '请求失败: ' + error.message,
                model: modelId,
                latency
            });
        });

        req.write(payload);
        req.end();
    });
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
    // CORS 支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 首页
    if (req.url === '/' && req.method === 'GET') {
        try {
            const html = fs.readFileSync(HTML_PATH, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // 获取配置
    if (req.url === '/api/config' && req.method === 'GET') {
        const config = readConfig();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(config));
        return;
    }

    // 保存配置
    if (req.url === '/api/config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { providerId, config: providerConfig } = JSON.parse(body);
                const currentConfig = readConfig();

                if (!currentConfig.provider) {
                    currentConfig.provider = {};
                }

                currentConfig.provider[providerId] = providerConfig;

                const success = writeConfig(currentConfig);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    // 删除 Provider
    if (req.url.startsWith('/api/config/') && req.method === 'DELETE') {
        const providerId = req.url.split('/api/config/')[1];
        const currentConfig = readConfig();

        if (currentConfig.provider && currentConfig.provider[providerId]) {
            delete currentConfig.provider[providerId];
            const success = writeConfig(currentConfig);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Provider not found' }));
        }
        return;
    }

    // 探查模型
    if (req.url === '/api/discover-models' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { baseURL, apiKey } = JSON.parse(body);
                const models = await discoverModels(baseURL, apiKey);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ models }));
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // 测试模型连接
    if (req.url === '/api/test-model' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { baseURL, apiKey, modelId } = JSON.parse(body);
                const result = await testModelConnection(baseURL, apiKey, modelId);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '请求解析失败: ' + error.message }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    log('INFO', '服务器启动', { port: PORT, configPath: CONFIG_PATH, logPath: LOG_PATH });
    console.log(`
╔════════════════════════════════════════════╗
║   🛠️  OpenCode 配置管理器已启动！         ║
╚════════════════════════════════════════════╝

📍 访问地址: http://localhost:${PORT}
📝 配置文件: ${CONFIG_PATH}
📋 日志文件: ${LOG_PATH}

✨ 功能:
   • 可视化管理 Provider 配置
   • 自动探查可用模型列表
   • 测试模型连接状态
   • 支持添加、编辑、删除操作
   • 详细日志记录

按 Ctrl+C 停止服务器
`);
});

// 优雅退出
process.on('SIGINT', () => {
    log('INFO', '服务器关闭');
    console.log('\n\n👋 服务器已关闭');
    process.exit(0);
});
