/**
 * Validation Middleware Module
 *
 * Provides Express-style middleware functions for validating incoming
 * requests. Includes validation for provider configuration, model discovery,
 * and connection testing endpoints.
 *
 * @module middleware/validation
 */

const Validator = require('../utils/validator');

const validateProvider = (req, res, next) => {
    if (req.url === '/api/config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { valid, errors } = Validator.validateProviderConfig({
                    providerId: data.providerId,
                    ...data.config
                });
                
                if (!valid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, errors }));
                    return;
                }
                
                req.body = data;
                next();
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '无效的 JSON' }));
            }
        });
    } else {
        next();
    }
};

const validateDiscover = (req, res, next) => {
    if (req.url === '/api/discover-models' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                if (!Validator.isValidBaseURL(data.baseURL)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '无效的 Base URL' }));
                    return;
                }
                
                if (!Validator.isValidApiKey(data.apiKey)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '无效的 API Key' }));
                    return;
                }
                
                req.body = data;
                next();
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '无效的 JSON' }));
            }
        });
    } else {
        next();
    }
};

const validateTest = (req, res, next) => {
    if (req.url === '/api/test-model' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                if (!Validator.isValidBaseURL(data.baseURL)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '无效的 Base URL' }));
                    return;
                }
                
                if (!Validator.isValidApiKey(data.apiKey)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '无效的 API Key' }));
                    return;
                }
                
                if (!Validator.isValidModelId(data.modelId)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '无效的模型 ID' }));
                    return;
                }
                
                req.body = data;
                next();
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '无效的 JSON' }));
            }
        });
    } else {
        next();
    }
};

const cors = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    next();
};

const errorHandler = (error, req, res) => {
    console.error('未处理的错误:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: '服务器内部错误' }));
};

module.exports = {
    validateProvider,
    validateDiscover,
    validateTest,
    cors,
    errorHandler
};
