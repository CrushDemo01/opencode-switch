/**
 * OpenCode Switch Server
 *
 * Main HTTP server entry point. Configures middleware, routes, and static
 * file serving. Implements graceful shutdown and error handling.
 *
 * @module server/index
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const Logger = require('./utils/logger');
const middleware = require('./middleware/validation');
const configRoutes = require('./routes/config');
const modelRoutes = require('./routes/models');

const logger = new Logger();
const PORT = process.env.PORT || 3456;
const PUBLIC_PATH = path.join(__dirname, '../public');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const composeMiddleware = (middlewares) => {
    return (req, res, finalHandler) => {
        let index = 0;
        
        const next = () => {
            if (index >= middlewares.length) {
                finalHandler(req, res);
                return;
            }
            
            const middleware = middlewares[index++];
            middleware(req, res, next);
        };
        
        next();
    };
};

const serveStatic = (req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_PATH, url);
  
  if (!filePath.startsWith(PUBLIC_PATH)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return true;
  }
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return false;
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    return true;
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
    return true;
  }
};

const mainHandler = async (req, res) => {
  try {
    if (serveStatic(req, res)) return;
    
    const handled = configRoutes.handleRequest(req, res) || 
                   modelRoutes.handleRequest(req, res);
    
    if (!handled) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (error) {
    middleware.errorHandler(error, req, res);
  }
};

const handler = composeMiddleware([
    middleware.cors,
    middleware.validateProvider,
    middleware.validateDiscover,
    middleware.validateTest,
    mainHandler
]);

const server = http.createServer((req, res) => {
    handler(req, res, () => {});
});

server.listen(PORT, () => {
    logger.info('服务器启动', { port: PORT });
    console.log(`
╔════════════════════════════════════════════╗
║   🛠️  OpenCode 配置管理器已启动！         ║
╚════════════════════════════════════════════╝

📍 访问地址: http://localhost:${PORT}

按 Ctrl+C 停止服务器
`);
});

process.on('SIGINT', () => {
    logger.info('服务器关闭');
    console.log('\n👋 服务器已关闭');
    process.exit(0);
});
