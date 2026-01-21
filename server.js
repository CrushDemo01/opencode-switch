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
