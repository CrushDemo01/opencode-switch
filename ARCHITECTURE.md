# Architecture

OpenCode Switch Architecture Overview

## Overview

OpenCode Switch is a configuration management tool for OpenCode AI Providers. It consists of a lightweight HTTP server (Node.js) serving a single-page application (SPA) for managing provider configurations.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Single Page App                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │   UI Comps  │  │   API Utils │  │  Components  │  │  │
│  │  │             │  │             │  │              │  │  │
│  │  │ • ui.js     │  │ • api.js    │  │ • templates  │  │  │
│  │  │ • escape.js │  │             │  │ • history    │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server (Node.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    HTTP Server                         │  │
│  │              (src/server/index.js)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌─────────────┬──────────┼──────────┬─────────────┐       │
│  │             │          │          │             │       │
│  ▼             ▼          ▼          ▼             ▼       │
│ ┌──────┐  ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐  │
│ │Routes│  │Services│ │Middleware│ │  Utils   │ │ Static │  │
│ │      │  │        │ │          │ │          │ │ Files  │  │
│ │•config│  │•config │ │•validate │ │•logger   │ │        │  │
│ │•models│  │•model  │ │•cors     │ │•validator│ │•html   │  │
│ │      │  │•encrypt│ │          │ │          │ │•css    │  │
│ │      │  │        │ │          │ │          │ │•js     │  │
│ └──────┘  └────────┘ └────────┘ └──────────┘ └────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── server/
│   ├── index.js              # Entry point
│   ├── routes/               # HTTP route handlers
│   │   ├── config.js         # Configuration endpoints
│   │   └── models.js         # Model discovery/testing
│   ├── services/             # Business logic
│   │   ├── configService.js  # Config read/write with caching
│   │   ├── modelService.js   # Model discovery & testing
│   │   └── encryptionService.js # AES-256-GCM encryption
│   ├── middleware/           # Express-style middleware
│   │   └── validation.js     # Input validation
│   └── utils/                # Utility modules
│       ├── logger.js         # Rotating file logger
│       └── validator.js      # Input validation functions
│
└── public/                   # Static assets
    ├── index.html            # Main page
    ├── css/
    │   └── app.css           # Application styles
    └── js/
        ├── app.js            # Main application logic
        ├── components/       # UI components
        │   ├── ui.js         # UI utilities
        │   ├── history.js    # Config history management
        │   └── templates.js  # Provider templates
        └── utils/            # Client utilities
            ├── api.js        # API client
            └── escape.js     # XSS protection
```

## Module Descriptions

### Server Modules

#### Routes (`src/server/routes/`)

**config.js**
- Handles configuration CRUD operations
- Serves the main HTML page
- Endpoints: `GET /`, `GET /api/config`, `POST /api/config`, `DELETE /api/config/:id`

**models.js**
- Handles model discovery and testing
- Endpoints: `POST /api/discover-models`, `POST /api/test-model`

#### Services (`src/server/services/`)

**configService.js**
- Singleton service for configuration management
- Features:
  - JSON file read/write
  - In-memory caching (5s TTL)
  - Automatic encryption/decryption of API keys
  - Path configuration via CLI args or environment

**modelService.js**
- Handles AI model operations
- Features:
  - Automatic model discovery from `/models` endpoint
  - Connection testing via `/chat/completions`
  - URL normalization for various provider formats
  - Support for multiple response formats

**encryptionService.js**
- Singleton service for encryption
- Algorithm: AES-256-GCM
- Features:
  - Automatic master key generation/storage
  - Transparent encryption/decryption for config service
  - Secure key file permissions (0600)

#### Middleware (`src/server/middleware/`)

**validation.js**
- Express-style middleware functions
- Validates:
  - Provider ID format (alphanumeric + _-)
  - Base URL (valid HTTP/HTTPS)
  - API Key length (1-2048 chars)
  - Model ID format
- Provides CORS headers
- Global error handler

#### Utils (`src/server/utils/`)

**logger.js**
- Rotating file logger with level support
- Features:
  - Automatic log rotation by size (default 10MB)
  - Keeps 5 backup files
  - Colored console output
  - Log levels: DEBUG, INFO, WARN, ERROR

**validator.js**
- Pure validation functions
- Used by middleware and can be used independently
- Validates all input types with descriptive error messages

### Client Modules

#### Components (`src/public/js/components/`)

**ui.js**
- UI utility functions
- Features:
  - Toast message system
  - Modal creation
  - Provider card rendering (with XSS protection)
  - Template selector rendering

**history.js**
- Configuration history management
- Uses localStorage
- Stores up to 20 snapshots
- Features save, restore, clear operations

**templates.js**
- Predefined provider configurations
- 10+ popular providers with sensible defaults
- Used to quickly populate form fields

#### Utils (`src/public/js/utils/`)

**api.js**
- API client for server communication
- Methods for all backend endpoints
- Import/export functionality using File API

**escape.js**
- XSS protection utilities
- HTML entity escaping
- Recursive object escaping

## Data Flow

### Configuration Save Flow

```
User submits form
       │
       ▼
┌──────────────────┐
│  Client Validation│
│  (HTML5 + JS)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   API.post       │
│   /api/config    │
└────────┬─────────┘
         │ HTTP POST
         ▼
┌──────────────────┐
│  Validation       │
│  Middleware       │
│  (server-side)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  ConfigService    │
│  addOrUpdate()    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  EncryptionService│
│  encryptConfig()  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  fs.writeFileSync │
│  (JSON to disk)   │
└──────────────────┘
```

### Configuration Read Flow

```
Page loads / Refresh
       │
       ▼
┌──────────────────┐
│   API.getConfig  │
└────────┬─────────┘
         │ HTTP GET
         ▼
┌──────────────────┐
│  ConfigService   │
│  readConfig()    │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
  Cache    File
  Miss     System
    │         │
    └────┬────┘
         │
         ▼
┌──────────────────┐
│  EncryptionService│
│  decryptConfig()  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Response        │
│  (JSON)          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  EscapeUtils     │
│  (XSS protection)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  DOM Rendering   │
└──────────────────┘
```

## Security Architecture

### Defense in Depth

1. **Client-side**:
   - Input validation (HTML5 patterns)
   - XSS escaping before DOM insertion

2. **Transport**:
   - HTTP (localhost only)
   - CORS headers for development

3. **Server-side**:
   - Input validation middleware
   - Type checking
   - Length limits
   - Format validation (regex)

4. **Storage**:
   - API Key encryption (AES-256-GCM)
   - Secure file permissions
   - Path traversal prevention

### Encryption Details

```
API Key Plaintext
       │
       ▼
┌─────────────────────┐
│ EncryptionService   │
│                     │
│ 1. Generate IV      │
│ 2. Create cipher    │
│ 3. Encrypt          │
│ 4. Get auth tag     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Encrypted Format:   │
│ salt:iv:tag:data    │
└─────────────────────┘
```

## Performance Optimizations

### Server-side

1. **Configuration Caching**
   - In-memory cache with 5s TTL
   - Reduces file I/O for repeated reads

2. **Log Rotation**
   - Prevents unbounded log file growth
   - Automatic compression of old logs

### Client-side

1. **Lazy Loading**
   - Components loaded as needed
   - Modal content generated on demand

2. **Local Storage**
   - Configuration history stored locally
   - Reduces server requests

## Testing Strategy

### Unit Tests

Located in `tests/__tests__/`:
- `validator.test.js` - Input validation
- `logger.test.js` - Logging functionality

### Integration Tests

- API endpoint testing with supertest
- Service integration testing

### Manual Testing

- UI component testing
- End-to-end workflows
- Cross-browser testing

## CI/CD Pipeline

```
Push to main
     │
     ▼
┌─────────────────┐
│ GitHub Actions  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
  Test     Lint
    │         │
    └────┬────┘
         │
         ▼
   ┌─────────────┐
   │  Publish    │
   │  to npm     │
   └─────────────┘
```

## Future Considerations

### Potential Improvements

1. **Authentication**: Add user authentication for multi-user support
2. **Database**: Migrate from file-based to database storage
3. **WebSocket**: Real-time updates across multiple clients
4. **Plugin System**: Allow custom provider implementations
5. **Import Formats**: Support more configuration formats (YAML, TOML)

### Scalability

Current architecture is designed for single-user, local development. For multi-user or production deployment:

- Add authentication/authorization layer
- Use proper database (PostgreSQL, MongoDB)
- Implement proper session management
- Add rate limiting
- Use HTTPS with valid certificates

---

For more details on specific modules, see the JSDoc comments in the source code.
