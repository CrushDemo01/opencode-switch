# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-30

### 🎉 重大更新 - 完整重构

### 🔐 安全性增强

- **XSS 防护**: 所有用户输入自动 HTML 转义，防止跨站脚本攻击
- **API Key 加密**: 使用 AES-256-GCM 算法加密存储 API Key
- **输入验证**: 后端严格验证所有请求参数，防止恶意输入
- **静态文件安全**: 防止路径遍历攻击，严格限制可访问文件类型

### 🏗️ 架构重构

- **模块化后端**: 从单文件架构重构为清晰的模块结构
  - `routes/` - 路由处理
  - `services/` - 业务逻辑
  - `middleware/` - 中间件
  - `utils/` - 工具函数
- **组件化前端**: 前端代码拆分为可复用组件
  - `components/` - UI 组件、历史管理、预设模板
  - `utils/` - API 服务、XSS 防护
- **统一错误处理**: 全局错误捕获和统一的错误响应格式

### ✨ 新功能

- **配置导入/导出**: 支持 JSON 格式的配置备份与恢复
- **Provider 模板**: 10+ 常用 Provider 预设模板
  - OpenAI, Azure OpenAI, Anthropic Claude, Google Gemini
  - Ollama, LM Studio (本地服务)
  - OpenRouter, Groq, DeepSeek, SiliconFlow
- **配置历史/回滚**: 自动保存配置历史（最近 20 条），支持一键回滚
- **日志轮转**: 自动按大小（默认 10MB）分割日志文件
- **配置缓存**: 内存缓存提升读取性能（5 秒 TTL）

### 🛠️ 工程改进

- **测试框架**: 集成 Jest 单元测试框架
- **代码规范**: 添加 ESLint 和 Prettier 配置
- **CI/CD**: GitHub Actions 自动化测试和发布
- **npm 脚本**: 添加 `test`, `lint`, `format` 等开发命令
- **Node.js 版本**: 最低要求提升至 >= 16.0.0

### 🐛 修复

- 修复 Provider `options` 字段缺失时的空指针错误
- 修复 URL 拼接逻辑中的重复代码
- 修复错误处理不一致的问题

### 📚 文档

- 完整重构 README.md
- 新增 ARCHITECTURE.md 架构文档
- 新增 API.md 接口文档
- 新增本 CHANGELOG.md

---

## [1.0.0] - 2026-01-01

### 🎉 初始版本

### ✨ 功能

- 🎨 可视化界面 - 无需手动编辑 JSON 文件
- 🔍 自动探查模型 - 自动调用 API 获取可用模型列表
- ✏️ 手动添加模型 - 支持手动输入模型 ID
- 📝 完整的 CRUD 操作 - 添加、查看、编辑、删除 Provider
- 🎯 模型选择 - 灵活选择需要的模型
- 📋 详细日志 - 记录所有操作和错误信息
- 📱 响应式设计 - 支持桌面和移动端
- 🌍 全局命令 - 安装后可在任意目录使用

---

[2.0.0]: https://github.com/your-repo/opencode-switch/releases/tag/v2.0.0
[1.0.0]: https://github.com/your-repo/opencode-switch/releases/tag/v1.0.0
