# OpenCode Switch

🛠️ 可视化配置管理工具，用于轻松管理 OpenCode AI Provider 配置

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## ✨ 功能特性

- 🎨 **可视化界面** - 无需手动编辑 JSON 文件
- 🔍 **自动探查模型** - 自动调用 API 获取可用模型列表
- ✏️ **手动添加模型** - 支持手动输入模型 ID
- 📝 **完整的 CRUD 操作** - 添加、查看、编辑、删除 Provider
- 🎯 **模型选择** - 灵活选择需要的模型
- 📋 **详细日志** - 记录所有操作和错误信息
- 📱 **响应式设计** - 支持桌面和移动端
- 🌍 **全局命令** - 安装后可在任意目录使用

## 📦 安装

### 方式一：全局安装（推荐）

全局安装后，可以在任意目录下使用命令启动工具：

```bash
# 克隆项目
git clone <your-repo-url>
cd opencode-switch

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

如果只想在项目目录下运行：

```bash
# 克隆项目
git clone <your-repo-url>
cd opencode-switch

# 直接运行（无需安装依赖）
npm start
```

### 卸载

如果需要卸载全局安装：

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

### 本地运行

在项目目录下运行：

```bash
npm start
```

或者直接运行：

```bash
node server.js
```

### 指定配置文件

你可以通过命令行参数指定配置文件路径：

```bash
# 全局命令方式
opencode-switch --config=/path/to/your/config.json

# 本地运行方式
node server.js --config=/path/to/your/config.json
```

或者使用环境变量：

```bash
# 全局命令方式
OPENCODE_CONFIG_PATH=/path/to/your/config.json opencode-switch

# 本地运行方式
OPENCODE_CONFIG_PATH=/path/to/your/config.json npm start
```

### 自定义端口

默认端口是 3456，你可以通过环境变量修改：

```bash
# 全局命令方式
PORT=8080 opencode-switch

# 本地运行方式
PORT=8080 npm start
```

### 组合使用

同时指定端口和配置文件：

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
3. 填写 **Base URL**（API 地址，如 `https://api.openai.com/v1`）
4. 填写 **API Key**

### 3. 添加模型

#### 方式一：自动探查
- 点击 **"🔍 自动探查模型"** 按钮
- 系统会自动调用 `{baseURL}/models` API
- 选择需要的模型

#### 方式二：手动添加
- 点击 **"✏️ 手动添加模型"** 按钮
- 每行输入一个模型 ID，例如：
  ```
  gpt-4
  claude-3-opus
  gemini-pro
  ```
- 点击 **"添加模型"**
- 选择需要的模型

### 4. 保存配置

- 点击 **"💾 保存配置"** 按钮
- 配置会立即写入文件

### 5. 管理现有 Provider

- **编辑**：点击 Provider 卡片上的 "✏️ 编辑" 按钮
- **删除**：点击 "🗑️ 删除" 按钮

## 📁 项目结构

```
opencode-switch/
├── bin/
│   └── opencode-switch.js   # CLI 入口文件
├── server.js                 # HTTP 服务器
├── index.html                # Web 界面
├── package.json              # 项目配置
├── README.md                 # 说明文档
├── config-manager.log        # 运行日志（自动生成）
└── .gitignore                # Git 忽略文件
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
        "apiKey": "sk-xxx"
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

## 📋 日志

所有操作和错误都会记录在 `config-manager.log` 文件中。

查看实时日志：
```bash
tail -f config-manager.log
```

查看错误日志：
```bash
grep ERROR config-manager.log
```

## 🛠️ API 端点

- `GET /` - Web 界面
- `GET /api/config` - 获取配置
- `POST /api/config` - 保存 Provider 配置
- `DELETE /api/config/:id` - 删除 Provider
- `POST /api/discover-models` - 探查模型

## 🎯 使用场景

### 场景一：快速启动（推荐）

```bash
# 全局安装一次
npm install -g .

# 之后在任意目录使用
cd ~/projects/my-app
opencode-switch
```

### 场景二：管理多个配置文件

```bash
# 为不同项目管理不同的配置
opencode-switch --config=~/project-a/opencode.json
opencode-switch --config=~/project-b/opencode.json
```

### 场景三：团队协作

```bash
# 在项目目录下运行，配置文件可以提交到 git
cd ~/team-project
opencode-switch --config=./opencode.json
```

## 💡 常见问题

### Q: 全局安装后找不到命令？
A: 确保 npm 全局 bin 目录在 PATH 中。运行 `npm config get prefix` 查看路径，然后将 `<prefix>/bin` 添加到 PATH。

### Q: 自动探查模型失败怎么办？
A: 使用 **"✏️ 手动添加模型"** 功能，手动输入模型 ID。

### Q: 如何查看错误日志？
A: 全局安装时，日志文件在当前工作目录下的 `config-manager.log`。本地运行时，在项目目录下。

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
npm install -g .
```

### Q: 全局安装和本地运行有什么区别？
A:
- **全局安装**：可以在任意目录使用 `opencode-switch` 命令
- **本地运行**：需要在项目目录下运行 `npm start`

两种方式功能完全相同，推荐使用全局安装以获得更好的使用体验。

## 🌟 界面说明

界面采用左右布局：
- **左侧**：添加/编辑表单
  - Provider 基本信息输入
  - 模型探查和添加功能
  - 保存按钮
- **右侧**：当前配置的 Providers 列表
  - 显示所有已配置的 Provider
  - 每个 Provider 的编辑/删除按钮
  - 实时显示配置状态

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 📞 支持

如有问题，请提交 Issue。

## 🔄 更新日志

### v1.0.0 (当前版本)
- ✅ 基础的 Provider 管理功能
- ✅ 自动探查和手动添加模型
- ✅ 可视化 Web 界面
- ✅ 详细日志记录
- ✅ 全局命令支持
- ✅ 自定义配置文件路径
- ✅ 自定义服务端口

## 🚀 未来计划

- [ ] 支持批量导入/导出配置
- [ ] 模型测试功能（测试 API 连接）
- [ ] 配置模板功能
- [ ] 多语言支持
- [ ] Docker 支持
