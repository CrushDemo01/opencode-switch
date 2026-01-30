# OpenCode Switch

**Visual configuration manager for OpenCode AI Provider settings**

## 📦 Installation

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

### Option 1: Global Installation (Recommended)

```bash
git clone <your-repo-url>
cd opencode-switch
npm install
npm install -g .
```

Run from anywhere:

```bash
opencode-switch
# or alias
ocs
```

### Option 2: Local Installation

```bash
git clone <your-repo-url>
cd opencode-switch
npm install
npm start
```

## 🚀 Usage

Start the server:

```bash
opencode-switch
```

Access the interface at `http://localhost:3456`.

### Configuration Options

Specify config file path:

```bash
opencode-switch --config=/path/to/config.json
# or
OPENCODE_CONFIG_PATH=/path/to/config.json opencode-switch
```

Custom port:

```bash
PORT=8080 opencode-switch
```

## 📖 Guide

1.  **Add Provider**: Enter Provider ID, Base URL, and API Key.
2.  **Add Models**:
    - **Auto-discover**: Click "🔍 Discover Models".
    - **Manual**: Click "✏️ Manual Add" and enter model IDs.
3.  **Save**: Click "💾 Save Config".

## 🔧 Configuration File Format

File location: `~/.config/opencode/opencode.json` (default)

```json
{
  "provider": {
    "openai": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenAI",
      "options": {
        "baseURL": "https://api.openai.com/v1",
        "apiKey": "ENCRYPTED_API_KEY"
      },
      "models": {
        "gpt-4": { "name": "gpt-4" }
      }
    }
  }
}
```

## 🎯 API Endpoints

- `GET /` - Web Interface
- `GET /api/config` - Get configuration
- `POST /api/config` - Save configuration
- `DELETE /api/config/:id` - Delete provider
- `POST /api/discover-models` - Discover models
- `POST /api/test-model` - Test model connection

## 📄 License

MIT License
