/**
 * Model Providers Registry for Strands Studio UI
 * 
 * Defines all supported model providers, their configuration fields,
 * available models, and code generation templates.
 * 
 * Based on Strands Agents SDK supported providers:
 * https://strandsagents.com/docs/user-guide/concepts/model-providers/
 */

// --- Types ---

export interface ModelOption {
  model_id: string;
  model_name: string;
}

export interface ProviderField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
  helpText?: string;
  options?: { value: string; label: string }[];
}

export interface ModelProvider {
  id: string;
  name: string;
  description: string;
  category: 'official' | 'community';
  pythonSupport: boolean;
  typescriptSupport: boolean;
  /** Python import path, e.g. 'strands.models.openai' */
  importPath: string;
  /** Python class name, e.g. 'OpenAIModel' */
  className: string;
  /** pip extra install name, e.g. 'openai' for pip install strands-agents[openai] */
  pipExtra?: string;
  /** Whether the model list is a fixed dropdown or free-text */
  modelSelection: 'dropdown' | 'text';
  /** Available models (for dropdown selection) */
  models?: ModelOption[];
  /** Provider-specific config fields (API key, base URL, etc.) */
  fields: ProviderField[];
  /** Whether this provider supports thinking/extended reasoning */
  supportsThinking?: boolean;
  /** Thinking config type */
  thinkingConfig?: 'budget_tokens' | 'reasoning_effort';
}

// --- Model Lists ---

export const BEDROCK_MODELS: ModelOption[] = [
  { model_id: "global.anthropic.claude-haiku-4-5-20251001-v1:0", model_name: "Claude 4.5 Haiku (global)" },
  { model_id: "us.anthropic.claude-haiku-4-5-20251001-v1:0", model_name: "Claude 4.5 Haiku (US)" },
  { model_id: "eu.anthropic.claude-haiku-4-5-20251001-v1:0", model_name: "Claude 4.5 Haiku (EU)" },
  { model_id: "global.anthropic.claude-sonnet-4-5-20250929-v1:0", model_name: "Claude 4.5 Sonnet (global)" },
  { model_id: "us.anthropic.claude-sonnet-4-5-20250929-v1:0", model_name: "Claude 4.5 Sonnet (US)" },
  { model_id: "eu.anthropic.claude-sonnet-4-5-20250929-v1:0", model_name: "Claude 4.5 Sonnet (EU)" },
  { model_id: "global.anthropic.claude-sonnet-4-20250514-v1:0", model_name: "Claude 4 Sonnet (global)" },
  { model_id: "us.anthropic.claude-sonnet-4-20250514-v1:0", model_name: "Claude 4 Sonnet (US)" },
  { model_id: "eu.anthropic.claude-sonnet-4-20250514-v1:0", model_name: "Claude 4 Sonnet (EU)" },
  { model_id: "apac.anthropic.claude-sonnet-4-20250514-v1:0", model_name: "Claude 4 Sonnet (APAC)" },
  { model_id: "us.anthropic.claude-3-7-sonnet-20250219-v1:0", model_name: "Claude 3.7 Sonnet (US)" },
  { model_id: "eu.anthropic.claude-3-7-sonnet-20250219-v1:0", model_name: "Claude 3.7 Sonnet (EU)" },
  { model_id: "apac.anthropic.claude-3-7-sonnet-20250219-v1:0", model_name: "Claude 3.7 Sonnet (APAC)" },
  { model_id: "openai.gpt-oss-120b-1:0", model_name: "GPT-OSS-120B" },
  { model_id: "qwen.qwen3-235b-a22b-2507-v1:0", model_name: "Qwen3 235B A22B 2507" },
  { model_id: "qwen.qwen3-32b-v1:0", model_name: "Qwen3 32B (dense)" },
  { model_id: "qwen.qwen3-coder-480b-a35b-v1:0", model_name: "Qwen3 Coder 480B A35B Instruct" },
  { model_id: "deepseek.v3-v1:0", model_name: "DeepSeek-V3.1" },
  { model_id: "us.amazon.nova-premier-v1:0", model_name: "Amazon Nova Premier v1" },
  { model_id: "us.amazon.nova-pro-v1:0", model_name: "Amazon Nova Pro v1" },
];

export const ANTHROPIC_MODELS: ModelOption[] = [
  { model_id: "claude-sonnet-4-5-20250929", model_name: "Claude 4.5 Sonnet" },
  { model_id: "claude-haiku-4-5-20251001", model_name: "Claude 4.5 Haiku" },
  { model_id: "claude-sonnet-4-20250514", model_name: "Claude 4 Sonnet" },
  { model_id: "claude-3-7-sonnet-20250219", model_name: "Claude 3.7 Sonnet" },
  { model_id: "claude-3-5-haiku-20241022", model_name: "Claude 3.5 Haiku" },
  { model_id: "claude-3-5-sonnet-20241022", model_name: "Claude 3.5 Sonnet v2" },
];

export const GOOGLE_MODELS: ModelOption[] = [
  { model_id: "gemini-2.5-flash", model_name: "Gemini 2.5 Flash" },
  { model_id: "gemini-2.5-pro", model_name: "Gemini 2.5 Pro" },
  { model_id: "gemini-2.0-flash", model_name: "Gemini 2.0 Flash" },
  { model_id: "gemini-1.5-pro", model_name: "Gemini 1.5 Pro" },
  { model_id: "gemini-1.5-flash", model_name: "Gemini 1.5 Flash" },
];

export const MISTRAL_MODELS: ModelOption[] = [
  { model_id: "mistral-large-latest", model_name: "Mistral Large" },
  { model_id: "mistral-medium-latest", model_name: "Mistral Medium" },
  { model_id: "mistral-small-latest", model_name: "Mistral Small" },
  { model_id: "codestral-latest", model_name: "Codestral" },
  { model_id: "open-mistral-nemo", model_name: "Mistral Nemo" },
];

// --- Provider Definitions ---

export const MODEL_PROVIDERS: ModelProvider[] = [
  // ===== OFFICIAL PROVIDERS =====
  {
    id: 'bedrock',
    name: 'AWS Bedrock',
    description: 'Default provider with wide model selection and enterprise features',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: true,
    importPath: 'strands.models.bedrock',
    className: 'BedrockModel',
    modelSelection: 'dropdown',
    models: BEDROCK_MODELS,
    fields: [
      {
        key: 'region',
        label: 'AWS Region',
        type: 'text',
        placeholder: 'us-east-1 (uses default from AWS config)',
        required: false,
        helpText: 'Leave empty to use default AWS region from credentials',
      },
    ],
    supportsThinking: true,
    thinkingConfig: 'budget_tokens',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models with Chat Completions API',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: true,
    importPath: 'strands.models.openai',
    className: 'OpenAIModel',
    pipExtra: 'openai',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-...',
        required: true,
        helpText: 'Stored as OPENAI_API_KEY environment variable',
      },
      {
        key: 'baseUrl',
        label: 'Base URL (Optional)',
        type: 'url',
        placeholder: 'https://api.openai.com/v1 (default)',
        required: false,
        helpText: 'Leave empty for default OpenAI endpoint. Set for Azure OpenAI or proxies.',
      },
    ],
    supportsThinking: true,
    thinkingConfig: 'reasoning_effort',
  },
  {
    id: 'openai_responses',
    name: 'OpenAI Responses API',
    description: 'OpenAI Responses API with built-in tool support',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: true,
    importPath: 'strands.models.openai_responses',
    className: 'OpenAIResponsesModel',
    pipExtra: 'openai',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-...',
        required: true,
        helpText: 'Stored as OPENAI_API_KEY environment variable',
      },
      {
        key: 'baseUrl',
        label: 'Base URL (Optional)',
        type: 'url',
        placeholder: 'https://api.openai.com/v1 (default)',
        required: false,
      },
    ],
    supportsThinking: true,
    thinkingConfig: 'reasoning_effort',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Direct Claude API access (not via Bedrock)',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: true,
    importPath: 'strands.models.anthropic',
    className: 'AnthropicModel',
    pipExtra: 'anthropic',
    modelSelection: 'dropdown',
    models: ANTHROPIC_MODELS,
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-ant-...',
        required: true,
        helpText: 'Stored as ANTHROPIC_API_KEY environment variable',
      },
    ],
    supportsThinking: true,
    thinkingConfig: 'budget_tokens',
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    description: 'Google Gemini models with tool calling support',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: true,
    importPath: 'strands.models.google',
    className: 'GoogleModel',
    pipExtra: 'google',
    modelSelection: 'dropdown',
    models: GOOGLE_MODELS,
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'AIza...',
        required: true,
        helpText: 'Stored as GOOGLE_API_KEY environment variable',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Run open-source models locally',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands.models.ollama',
    className: 'OllamaModel',
    pipExtra: 'ollama',
    modelSelection: 'text',
    fields: [
      {
        key: 'host',
        label: 'Host URL',
        type: 'url',
        placeholder: 'http://localhost:11434',
        required: false,
        defaultValue: 'http://localhost:11434',
        helpText: 'Ollama server address. Default: http://localhost:11434',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'litellm',
    name: 'LiteLLM',
    description: 'Universal proxy — route to 100+ LLM providers',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands.models.litellm',
    className: 'LiteLLMModel',
    pipExtra: 'litellm',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key (Optional)',
        type: 'password',
        placeholder: 'Provider-specific API key',
        required: false,
        helpText: 'API key for the underlying provider (if needed)',
      },
      {
        key: 'baseUrl',
        label: 'LiteLLM Proxy URL (Optional)',
        type: 'url',
        placeholder: 'http://localhost:4000 (if using LiteLLM proxy)',
        required: false,
        helpText: 'Set if using a LiteLLM proxy server',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'mistral',
    name: 'MistralAI',
    description: 'Mistral models including Codestral',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands.models.mistral',
    className: 'MistralModel',
    pipExtra: 'mistral',
    modelSelection: 'dropdown',
    models: MISTRAL_MODELS,
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Your Mistral API key',
        required: true,
        helpText: 'Stored as MISTRAL_API_KEY environment variable',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'llamaapi',
    name: 'LlamaAPI',
    description: 'Hosted Llama models via API',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands.models.llamaapi',
    className: 'LlamaAPIModel',
    pipExtra: 'llamaapi',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Your LlamaAPI key',
        required: true,
        helpText: 'Stored as LLAMA_API_KEY environment variable',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'llamacpp',
    name: 'llama.cpp',
    description: 'Run GGUF models locally via llama.cpp server',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands.models.llamacpp',
    className: 'LlamaCppModel',
    pipExtra: 'llamacpp',
    modelSelection: 'text',
    fields: [
      {
        key: 'host',
        label: 'Server URL',
        type: 'url',
        placeholder: 'http://localhost:8080',
        required: false,
        defaultValue: 'http://localhost:8080',
        helpText: 'llama.cpp server address',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'sagemaker',
    name: 'SageMaker',
    description: 'Deploy and invoke models on Amazon SageMaker',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands.models.sagemaker',
    className: 'SageMakerModel',
    modelSelection: 'text',
    fields: [
      {
        key: 'endpointName',
        label: 'Endpoint Name',
        type: 'text',
        placeholder: 'my-sagemaker-endpoint',
        required: true,
        helpText: 'Name of your deployed SageMaker endpoint',
      },
      {
        key: 'region',
        label: 'AWS Region',
        type: 'text',
        placeholder: 'us-east-1',
        required: false,
        helpText: 'Leave empty to use default AWS region',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'writer',
    name: 'Writer',
    description: 'Writer AI platform models',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands.models.writer',
    className: 'WriterModel',
    pipExtra: 'writer',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Your Writer API key',
        required: true,
        helpText: 'Stored as WRITER_API_KEY environment variable',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    description: 'Any OpenAI-compatible endpoint (vLLM, Together, Groq, etc.)',
    category: 'official',
    pythonSupport: true,
    typescriptSupport: true,
    importPath: 'strands.models.openai',
    className: 'OpenAIModel',
    pipExtra: 'openai',
    modelSelection: 'text',
    fields: [
      {
        key: 'baseUrl',
        label: 'Base URL',
        type: 'url',
        placeholder: 'https://api.together.xyz/v1',
        required: true,
        helpText: 'The OpenAI-compatible API endpoint URL',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Your API key',
        required: true,
        helpText: 'API key for the provider',
      },
    ],
    supportsThinking: false,
  },

  // ===== COMMUNITY PROVIDERS =====
  {
    id: 'nvidia_nim',
    name: 'NVIDIA NIM',
    description: 'NVIDIA NIM inference microservices',
    category: 'community',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands_nvidia_nim.model',
    className: 'NVIDIANIMModel',
    pipExtra: 'strands-agents-nvidia-nim',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'nvapi-...',
        required: true,
        helpText: 'NVIDIA API key',
      },
      {
        key: 'baseUrl',
        label: 'Base URL (Optional)',
        type: 'url',
        placeholder: 'https://integrate.api.nvidia.com/v1',
        required: false,
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Cohere Command models',
    category: 'community',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands_cohere.model',
    className: 'CohereModel',
    pipExtra: 'strands-agents-cohere',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Your Cohere API key',
        required: true,
        helpText: 'Stored as COHERE_API_KEY environment variable',
      },
    ],
    supportsThinking: false,
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    description: 'xAI Grok models',
    category: 'community',
    pythonSupport: true,
    typescriptSupport: false,
    importPath: 'strands_xai.model',
    className: 'XAIModel',
    pipExtra: 'strands-agents-xai',
    modelSelection: 'text',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Your xAI API key',
        required: true,
        helpText: 'Stored as XAI_API_KEY environment variable',
      },
    ],
    supportsThinking: false,
  },
];

// --- Helper Functions ---

/** Get a provider by its ID */
export function getProvider(providerId: string): ModelProvider | undefined {
  return MODEL_PROVIDERS.find(p => p.id === providerId);
}

/** Get all official providers */
export function getOfficialProviders(): ModelProvider[] {
  return MODEL_PROVIDERS.filter(p => p.category === 'official');
}

/** Get all community providers */
export function getCommunityProviders(): ModelProvider[] {
  return MODEL_PROVIDERS.filter(p => p.category === 'community');
}

/** Get the default model for a provider */
export function getDefaultModel(providerId: string): ModelOption | undefined {
  const provider = getProvider(providerId);
  if (provider?.models && provider.models.length > 0) {
    return provider.models[0];
  }
  return undefined;
}

/** Map old provider names to new provider IDs (backwards compatibility) */
export function migrateProviderName(oldName: string): string {
  const mapping: Record<string, string> = {
    'AWS Bedrock': 'bedrock',
    'OpenAI': 'openai',
    'Anthropic': 'anthropic',
  };
  return mapping[oldName] || oldName;
}

/** Get the environment variable name for a provider's API key */
export function getApiKeyEnvVar(providerId: string): string | undefined {
  const envVarMap: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    openai_responses: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    llamaapi: 'LLAMA_API_KEY',
    writer: 'WRITER_API_KEY',
    custom: 'OPENAI_API_KEY',
    nvidia_nim: 'NVIDIA_API_KEY',
    cohere: 'COHERE_API_KEY',
    xai: 'XAI_API_KEY',
  };
  return envVarMap[providerId];
}
