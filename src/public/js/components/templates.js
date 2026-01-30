/**
 * Provider Templates Module
 *
 * Predefined configuration templates for popular AI providers.
 * Used to quickly populate provider settings with sensible defaults.
 *
 * @module components/templates
 */
const ProviderTemplates = {
    openai: {
        name: 'OpenAI',
        npm: '@ai-sdk/openai-compatible',
        baseURL: 'https://api.openai.com/v1',
        description: 'OpenAI 官方 API'
    },
    azure: {
        name: 'Azure OpenAI',
        npm: '@ai-sdk/azure',
        baseURL: 'https://{resource}.openai.azure.com/openai/deployments/{deployment}',
        description: 'Microsoft Azure OpenAI 服务'
    },
    anthropic: {
        name: 'Anthropic Claude',
        npm: '@ai-sdk/anthropic',
        baseURL: 'https://api.anthropic.com/v1',
        description: 'Anthropic Claude API'
    },
    google: {
        name: 'Google Gemini',
        npm: '@ai-sdk/google',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        description: 'Google Gemini API'
    },
    ollama: {
        name: 'Ollama',
        npm: '@ai-sdk/ollama',
        baseURL: 'http://localhost:11434/v1',
        description: '本地 Ollama 服务'
    },
    lmstudio: {
        name: 'LM Studio',
        npm: '@ai-sdk/openai-compatible',
        baseURL: 'http://localhost:1234/v1',
        description: 'LM Studio 本地服务'
    },
    openrouter: {
        name: 'OpenRouter',
        npm: '@ai-sdk/openai-compatible',
        baseURL: 'https://openrouter.ai/api/v1',
        description: 'OpenRouter 聚合服务'
    },
    groq: {
        name: 'Groq',
        npm: '@ai-sdk/groq',
        baseURL: 'https://api.groq.com/openai/v1',
        description: 'Groq 高速推理'
    },
    deepseek: {
        name: 'DeepSeek',
        npm: '@ai-sdk/openai-compatible',
        baseURL: 'https://api.deepseek.com/v1',
        description: 'DeepSeek API'
    },
    siliconflow: {
        name: 'SiliconFlow',
        npm: '@ai-sdk/openai-compatible',
        baseURL: 'https://api.siliconflow.cn/v1',
        description: '硅基流动中国API'
    }
};

if (typeof window !== 'undefined') {
    window.ProviderTemplates = ProviderTemplates;
}
