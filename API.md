# API Documentation

OpenCode Switch HTTP API Reference

## Base URL

All API endpoints are relative to the server base URL (default: `http://localhost:3456`).

## Authentication

Currently, the API does not require authentication as it's designed for local development use only.

## Content Type

All requests and responses use `application/json` content type unless otherwise specified.

## Endpoints

### 1. Get Configuration

Retrieve the current configuration including all providers.

**Endpoint:** `GET /api/config`

**Response:**
```json
{
  "provider": {
    "openai": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenAI",
      "options": {
        "baseURL": "https://api.openai.com/v1",
        "apiKey": "sk-..."
      },
      "models": {
        "gpt-4": {
          "name": "gpt-4"
        }
      }
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success

---

### 2. Save Provider

Add a new provider or update an existing one.

**Endpoint:** `POST /api/config`

**Request Body:**
```json
{
  "providerId": "openai",
  "config": {
    "npm": "@ai-sdk/openai-compatible",
    "name": "OpenAI",
    "options": {
      "baseURL": "https://api.openai.com/v1",
      "apiKey": "sk-your-api-key"
    },
    "models": {
      "gpt-4": {
        "name": "gpt-4"
      },
      "gpt-3.5-turbo": {
        "name": "gpt-3.5-turbo"
      }
    }
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `providerId` | string | Yes | Unique provider identifier (alphanumeric, `_`, `-`) |
| `config.npm` | string | No | NPM package name |
| `config.name` | string | No | Display name |
| `config.options.baseURL` | string | Yes | API base URL (must be valid HTTP/HTTPS) |
| `config.options.apiKey` | string | Yes | API key (will be encrypted) |
| `config.models` | object | No | Map of model configurations |

**Response:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "success": false,
  "errors": [
    "Provider ID 只能包含字母、数字、下划线和连字符",
    "Base URL 格式无效"
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Validation error

---

### 3. Delete Provider

Remove a provider from the configuration.

**Endpoint:** `DELETE /api/config/:providerId`

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `providerId` | string | The provider identifier to delete |

**Response:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Provider not found"
}
```

**Status Codes:**
- `200 OK` - Successfully deleted
- `404 Not Found` - Provider doesn't exist

---

### 4. Discover Models

Automatically discover available models from a provider's API.

**Endpoint:** `POST /api/discover-models`

**Request Body:**
```json
{
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "sk-your-api-key"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `baseURL` | string | Yes | Provider API base URL |
| `apiKey` | string | Yes | API key for authentication |

**Response (Success):**
```json
{
  "models": {
    "gpt-4": {
      "name": "gpt-4"
    },
    "gpt-3.5-turbo": {
      "name": "gpt-3.5-turbo"
    },
    "gpt-4-turbo-preview": {
      "name": "gpt-4-turbo-preview"
    }
  }
}
```

**Response (Error):**
```json
{
  "error": "无法探查模型，已尝试: /v1/models, /models"
}
```

**Status Codes:**
- `200 OK` - Request processed (check response for success/failure)

**Notes:**
- Attempts multiple endpoint paths: `/v1/models`, `/models`
- Supports both array and object response formats
- Returns model ID as both key and name

---

### 5. Test Model Connection

Test connectivity to a specific model.

**Endpoint:** `POST /api/test-model`

**Request Body:**
```json
{
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "sk-your-api-key",
  "modelId": "gpt-4"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `baseURL` | string | Yes | Provider API base URL |
| `apiKey` | string | Yes | API key for authentication |
| `modelId` | string | Yes | Model identifier to test |

**Response (Success):**
```json
{
  "success": true,
  "message": "Hello! How can I help you today?",
  "model": "gpt-4",
  "latency": 1234,
  "raw": "{\"choices\":[{\"message\":{\"content\":\"Hello!\"}}]}"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "API 返回错误状态码: 401",
  "model": "gpt-4",
  "latency": 234
}
```

**Status Codes:**
- `200 OK` - Request processed (check `success` field for result)

**Notes:**
- Sends a minimal chat completion request ("Hi")
- Measures request latency
- Attempts to extract content from various response formats
- Returns raw response preview for debugging

---

### 6. Serve Web Interface

Serve the main web application.

**Endpoint:** `GET /`

**Response:** HTML document

**Content-Type:** `text/html; charset=utf-8`

---

## Error Handling

### Validation Errors

When validation fails, the API returns a `400 Bad Request` with details:

```json
{
  "success": false,
  "errors": [
    "Provider ID 只能包含字母、数字、下划线和连字符，长度1-64字符",
    "Base URL 格式无效，必须是有效的 http/https URL"
  ]
}
```

### Server Errors

Unexpected errors return `500 Internal Server Error`:

```json
{
  "success": false,
  "error": "服务器内部错误"
}
```

## Validation Rules

### Provider ID
- Pattern: `^[a-zA-Z0-9_-]+$`
- Length: 1-64 characters
- Examples: `openai`, `my-provider`, `provider_123`

### Base URL
- Must be valid URL
- Protocol: `http:` or `https:`
- Examples: `https://api.openai.com/v1`, `http://localhost:11434/v1`

### API Key
- Length: 1-2048 characters
- No format restrictions (varies by provider)

### Model ID
- Length: 1-256 characters
- Examples: `gpt-4`, `claude-3-opus-20240229`

## Client-Side API Module

The frontend provides an `API` object for convenient server communication:

```javascript
// Get configuration
const config = await API.getConfig();

// Save provider
await API.saveProvider('openai', providerConfig);

// Delete provider
await API.deleteProvider('openai');

// Discover models
const { models, error } = await API.discoverModels(baseURL, apiKey);

// Test model
const result = await API.testModel(baseURL, apiKey, modelId);

// Export configuration
await API.exportConfig();

// Import configuration
const file = document.getElementById('import').files[0];
const { count } = await API.importConfig(file);
```

## CORS

The server includes CORS headers for development:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Rate Limiting

Currently, no rate limiting is implemented as the tool is designed for local development use only.

## Security Considerations

1. **Input Validation**: All inputs are validated server-side
2. **XSS Protection**: Client-side HTML escaping
3. **Encryption**: API keys are encrypted at rest
4. **Local Only**: Designed for localhost use; no authentication

For production deployment, consider adding:
- Authentication/authorization
- Rate limiting
- HTTPS enforcement
- Request logging

---

## WebSocket (Future)

Future versions may support WebSocket for real-time updates:

```
ws://localhost:3456/ws
```

Events:
- `config:updated` - Configuration changed
- `provider:added` - New provider added
- `provider:deleted` - Provider removed
