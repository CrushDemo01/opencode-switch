/**
 * Model Routes Module
 *
 * Defines HTTP routes for model discovery and connection testing.
 * Provides endpoints for auto-discovering available models and testing
 * API connectivity.
 *
 * @module routes/models
 */

const modelService = require('../services/modelService');

const routes = [
    {
        path: '/api/discover-models',
        method: 'POST',
        handler: async (req, res) => {
            try {
                const { baseURL, apiKey } = req.body;
                const models = await modelService.discoverModels(baseURL, apiKey);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ models }));
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        }
    },
    {
        path: '/api/test-model',
        method: 'POST',
        handler: async (req, res) => {
            try {
                const { baseURL, apiKey, modelId } = req.body;
                const result = await modelService.testConnection(baseURL, apiKey, modelId);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: '请求解析失败: ' + error.message 
                }));
            }
        }
    }
];

function matchRoute(url, method) {
    return routes.find(route => route.path === url && route.method === method);
}

function handleRequest(req, res) {
    const route = matchRoute(req.url, req.method);
    
    if (route) {
        route.handler(req, res);
        return true;
    }
    
    return false;
}

module.exports = { routes, handleRequest };
