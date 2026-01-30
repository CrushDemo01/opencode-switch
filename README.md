# OpenCode Switch

🛠️ **可视化配置管理工具，用于轻松管理 OpenCode AI Provider 配置**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](package.json)
[![Tests](https://img.shields.io/badge/tests-jest-success.svg)](package.json)

## ✨ 功能特性

### 🎨 可视化界面
- 无需手动编辑 JSON 文件
- 响应式设计，支持桌面和移动端
- 现代化的 UI 组件

### 🔐 安全保障
- **XSS 防护** - 所有用户输入自动 HTML 转义
- **API Key 加密** - 使用 AES-256-GCM 加密存储
- **输入验证** - 后端严格验证所有请求参数

### 🚀 核心功能
- 🔍 **自动探查模型** - 自动调用 API 获取可用模型列表
- ✏️ **手动添加模型** - 支持手动输入模型 ID
- 📝 **完整的 CRUD 操作** - 添加、查看、编辑、删除 Provider
- 🎯 **模型选择** - 灵活选择需要的模型
- 📋 **配置导入/导出** - JSON 格式配置备份与恢复
- 🕐 **配置历史/回滚** - 本地存储历史版本，支持一键回滚
- 📦 **Provider 模板** - 10+ 常用 Provider 预设模板

### 🛠️ 工程特性
- 📋 **日志轮转** - 自动按大小分割日志文件
- ⚡ **配置缓存** - 内存缓存提升性能
- 🧪 **测试覆盖** - Jest 单元测试
- 🔧 **代码规范** - ESLint + Prettier
- 🚀 **CI/CD** - GitHub Actions 自动化

## 📦 安装

### 系统要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 方式一：全局安装（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd opencode-switch

# 安装依赖
npm install

# 全局安装
npm install -g .
```

安装完成后，可以在任意目录运行：

```bash
# 使用完整命令
opencode-switch

# 或使用简短别名
ocs
```

### 方式二：本地运行

```bash
# 克隆项目
git clone <your-repo-url>
cd opencode-switch

# 安装依赖
npm install

# 运行
npm start
```

### 卸载

```bash
npm uninstall -g opencode-switch
```

## 🚀 使用方法

### 基本用法

全局安装后，在任意目录运行：

```bash
opencode-switch
```

或使用简短别名：

```bash
ocs
```

默认情况下，会管理 `~/.config/opencode/opencode.json` 配置文件。

服务器启动后，访问 `http://localhost:3456`

### 指定配置文件

你可以通过命令行参数指定配置文件路径：

```bash
# 全局命令方式
opencode-switch --config=/path/to/your/config.json

# 本地运行方式
npm start -- --config=/path/to/your/config.json
```

或者使用环境变量：

```bash
OPENCODE_CONFIG_PATH=/path/to/your/config.json opencode-switch
```

### 自定义端口

默认端口是 3456，你可以通过环境变量修改：

```bash
PORT=8080 opencode-switch
```

### 组合使用

```bash
PORT=8080 opencode-switch --config=/custom/path/config.json
```

## 📖 使用指南

### 1. 启动服务器

```bash
opencode-switch
```

服务器启动后，访问 `http://localhost:3456`

### 2. 添加新的 Provider

1. 填写 **Provider ID**（唯一标识符，如 `openai`）
2. 填写 **显示名称**（可选，默认使用 Provider ID）
3. **选择模板**（可选）- 快速填充常用 Provider 配置
4. 填写 **Base URL**（API 地址）
5. 填写 **API Key**（自动加密存储）

#### 支持的 Provider 模板

- OpenAI
- Azure OpenAI
- Anthropic Claude
- Google Gemini
- Ollama (本地)
- LM Studio (本地)
- OpenRouter
- Groq
- DeepSeek
- SiliconFlow

### 3. 添加模型

#### 方式一：自动探查
- 填写 Base URL 和 API Key
- 点击 **"🔍 探查模型"** 按钮
- 系统会自动调用 `{baseURL}/models` API
- 选择需要的模型，点击确认

#### 方式二：手动添加
- 点击 **"✏️ 手动添加模型"** 按钮
- 每行输入一个模型 ID
- 点击 **"添加模型"**

### 4. 保存配置

- 点击 **"💾 保存配置"** 按钮
- 配置会立即写入文件（API Key 自动加密）
- 历史记录自动保存到浏览器本地存储

### 5. 管理现有 Provider

- **测试**：点击 ⚡ 测试 API 连接状态
- **编辑**：点击 ✏️ 编辑按钮
- **删除**：点击 🗑️ 删除按钮
- **导出**：点击 📤 导出完整配置
- **历史**：点击 🕐 查看配置历史并回滚

### 6. 配置导入/导出

**导出配置：**
- 点击头部 **"📤 导出"** 按钮
- 配置将下载为 JSON 文件

**导入配置：**
- 点击头部 **"📥 导入"** 按钮
- 选择之前导出的 JSON 文件
- 所有 Provider 将自动导入

### 7. 配置历史与回滚

- 每次保存配置时，系统会自动保存历史版本（最近 20 条）
- 点击 **"🕐 历史"** 按钮查看历史记录
- 点击 **"恢复"** 可回滚到任意历史版本

## 📁 项目结构

```
opencode-switch/
├── src/
│   ├── server/
│   │   ├── index.js              # 服务器入口
│   │   ├── routes/               # 路由处理
│   │   │   ├── config.js         # 配置路由
│   │   │   └── models.js         # 模型路由
│   │   ├── services/             # 业务逻辑
│   │   │   ├── configService.js  # 配置管理
│   │   │   ├── modelService.js   # 模型服务
│   │   │   └── encryptionService.js # 加密服务
│   │   ├── middleware/           # 中间件
│   │   │   └── validation.js     # 输入验证
│   │   └── utils/                # 工具函数
│   │       ├── logger.js         # 日志服务
│   │       └── validator.js      # 验证工具
│   └── public/
│       ├── index.html            # 主页面
│       ├── css/
│       │   └── app.css           # 样式文件
│       └── js/
│           ├── app.js            # 主应用逻辑
│           ├── components/
│           │   ├── ui.js         # UI 组件
│           │   ├── history.js    # 历史管理
│           │   └── templates.js  # Provider 模板
│           └── utils/
│               ├── api.js        # API 服务
│               └── escape.js     # XSS 防护
├── tests/                        # 测试文件
├── bin/
│   └── opencode-switch.js        # CLI 入口
├── package.json
└── README.md
```

## 🔧 开发

### 安装开发依赖

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 查看覆盖率报告
npm test -- --coverage
```

### 代码检查与格式化

```bash
# 运行 ESLint
npm run lint

# 运行 Prettier 格式化
npm run format
```

### 开发模式运行

```bash
npm run dev
```

## 📋 日志

所有操作和错误都会记录在 `config-manager.log` 文件中。日志支持自动轮转（默认 10MB）。

查看实时日志：
```bash
tail -f config-manager.log
```

查看错误日志：
```bash
grep ERROR config-manager.log
```

## 🔧 配置文件格式

生成的配置文件格式如下：

```json
{
  "provider": {
    "openai": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenAI",
      "options": {
        "baseURL": "https://api.openai.com/v1",
        "apiKey": "加密后的APIKey"
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
}
```

**注意：** API Key 在配置文件中是加密存储的，使用 AES-256-GCM 算法。

## 🛡️ 安全性

### XSS 防护
- 所有用户输入在渲染前都经过 HTML 转义
- 使用 `textContent` 替代 `innerHTML` 处理用户数据

### API Key 加密
- 使用 AES-256-GCM 算法加密存储
- 加密密钥存储在 `~/.config/opencode/.key`
- 密钥文件权限设置为 0600

### 输入验证
- 后端验证所有请求参数
- Provider ID 只允许字母、数字、下划线和连字符
- Base URL 必须是有效的 HTTP/HTTPS URL
- API Key 长度限制在 2048 字符以内

### 静态文件安全
- 防止路径遍历攻击
- 严格限制可访问的文件类型

## 🎯 API 端点

- `GET /` - Web 界面
- `GET /api/config` - 获取配置
- `POST /api/config` - 保存 Provider 配置
- `DELETE /api/config/:id` - 删除 Provider
- `POST /api/discover-models` - 探查模型
- `POST /api/test-model` - 测试模型连接

详细 API 文档请参阅 [API.md](API.md)

## 💡 常见问题

### Q: 全局安装后找不到命令？
A: 确保 npm 全局 bin 目录在 PATH 中。运行 `npm config get prefix` 查看路径，然后将 `<prefix>/bin` 添加到 PATH。

### Q: 自动探查模型失败怎么办？
A: 使用 **"✏️ 手动添加模型"** 功能，手动输入模型 ID。

### Q: 如何查看错误日志？
A: 日志文件在当前工作目录下的 `config-manager.log`。

### Q: 支持哪些 API？
A: 支持所有兼容 OpenAI API 格式的服务，包括：
- OpenAI
- Azure OpenAI
- Claude (通过兼容层)
- 本地模型服务 (Ollama, LM Studio 等)
- 其他兼容 OpenAI API 的服务

### Q: 配置文件在哪里？
A: 默认在 `~/.config/opencode/opencode.json`，可以通过 `--config` 参数或 `OPENCODE_CONFIG_PATH` 环境变量指定。

### Q: 如何更新到最新版本？
A:
```bash
cd opencode-switch
git pull
npm install
npm install -g .
```

### Q: 加密密钥丢失怎么办？
A: 如果 `~/.config/opencode/.key` 文件丢失或损坏，已加密的 API Key 将无法解密。你需要重新配置 Provider 的 API Key。

## 📚 架构文档

- [ARCHITECTURE.md](ARCHITECTURE.md) - 项目架构详解
- [API.md](API.md) - API 接口文档
- [CHANGELOG.md](CHANGELOG.md) - 更新日志

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

请确保：
- 代码通过 ESLint 检查
- 所有测试通过
- 新功能包含测试用例

## 📄 许可证

MIT License

## 📞 支持

如有问题，请提交 Issue。

---

**OpenCode Switch** - 让 AI Provider 配置管理更简单 🔧
