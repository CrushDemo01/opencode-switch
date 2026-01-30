/**
 * Configuration Routes Module
 *
 * Defines HTTP routes for configuration management including serving the UI,
 * reading, saving, and deleting provider configurations.
 *
 * @module routes/config
 */

const configService = require('../services/configService');
const fs = require('fs');
const path = require('path');

const PUBLIC_PATH = path.join(__dirname, '../../public');
const HTML_PATH = path.join(PUBLIC_PATH, 'index.html');

const routes = [
    {
        path: '/',
        method: 'GET',
        handler: (req, res) => {
            try {
                const html = fs.readFileSync(HTML_PATH, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        }
    },
    {
        path: '/api/config',
        method: 'GET',
        handler: (req, res) => {
            const config = configService.readConfig();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(config));
        }
    },
    {
        path: '/api/config',
        method: 'POST',
        handler: (req, res) => {
            const { providerId, config: providerConfig } = req.body;
            const success = configService.addOrUpdateProvider(providerId, providerConfig);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success }));
        }
    },
    {
        path: /^\/api\/config\//,
        method: 'DELETE',
        handler: (req, res) => {
            const providerId = req.url.split('/api/config/')[1];
            const success = configService.deleteProvider(providerId);
            
            res.writeHead(success ? 200 : 404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success, 
                error: success ? undefined : 'Provider not found' 
            }));
        }
    }
];

function matchRoute(url, method) {
    return routes.find(route => {
        if (route.method !== method) return false;
        
        if (typeof route.path === 'string') {
            return route.path === url;
        }
        
        if (route.path instanceof RegExp) {
            return route.path.test(url);
        }
        
        return false;
    });
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
