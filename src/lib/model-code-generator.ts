/**
 * Model Code Generator — Generates Python code for each model provider
 * 
 * Maps provider IDs from model-providers.ts to actual Python instantiation code
 * for the Strands Agents SDK.
 */

import { getProvider, getApiKeyEnvVar, migrateProviderName } from './model-providers';

interface ModelCodeGenOptions {
  varName: string;
  providerId: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  baseUrl?: string;
  apiKey?: string;
  host?: string;
  endpointName?: string;
  region?: string;
  thinkingEnabled?: boolean;
  thinkingBudgetTokens?: number;
  reasoningEffort?: string;
  /** Indentation prefix for tool-inside-agent patterns */
  indent?: string;
}

/**
 * Generate Python import statements for all providers used in a flow
 */
export function generateModelImports(providerIds: string[]): string[] {
  const imports: string[] = [];
  const seen = new Set<string>();

  for (const rawId of providerIds) {
    const id = migrateProviderName(rawId);
    const provider = getProvider(id);
    if (!provider || seen.has(provider.importPath)) continue;
    seen.add(provider.importPath);

    imports.push(`from ${provider.importPath} import ${provider.className}`);
  }

  // Always need os for env vars if any non-bedrock provider is used
  const needsOs = providerIds.some(id => {
    const pid = migrateProviderName(id);
    return pid !== 'bedrock';
  });
  if (needsOs && !imports.some(i => i.includes('import os'))) {
    imports.unshift('import os');
  }

  return imports;
}

/**
 * Generate Python model instantiation code for a given provider configuration
 */
export function generateModelCode(options: ModelCodeGenOptions): string {
  const {
    varName,
    providerId: rawProviderId,
    modelId,
    temperature,
    maxTokens,
    baseUrl,
    host,
    endpointName,
    region,
    thinkingEnabled,
    thinkingBudgetTokens,
    reasoningEffort,
    indent = '',
  } = options;

  const providerId = migrateProviderName(rawProviderId);
  const provider = getProvider(providerId);
  if (!provider) {
    // Fallback to Bedrock if provider unknown
    return `${indent}${varName}_model = BedrockModel(
${indent}    model_id="${modelId}",
${indent}    temperature=${temperature},
${indent}    max_tokens=${maxTokens}
${indent})`;
  }

  const isBudgetThinking = thinkingEnabled && provider.thinkingConfig === 'budget_tokens';
  const finalTemperature = isBudgetThinking ? 1 : temperature;

  switch (providerId) {
    case 'bedrock':
      return generateBedrockCode(varName, modelId, finalTemperature, maxTokens, thinkingEnabled, thinkingBudgetTokens, region, indent);

    case 'openai':
    case 'custom':
      return generateOpenAICode(varName, modelId, finalTemperature, maxTokens, baseUrl, thinkingEnabled, reasoningEffort, providerId, indent);

    case 'openai_responses':
      return generateOpenAIResponsesCode(varName, modelId, finalTemperature, maxTokens, baseUrl, thinkingEnabled, reasoningEffort, indent);

    case 'anthropic':
      return generateAnthropicCode(varName, modelId, finalTemperature, maxTokens, thinkingEnabled, thinkingBudgetTokens, indent);

    case 'google':
      return generateGoogleCode(varName, modelId, finalTemperature, maxTokens, indent);

    case 'ollama':
      return generateOllamaCode(varName, modelId, finalTemperature, maxTokens, host, indent);

    case 'litellm':
      return generateLiteLLMCode(varName, modelId, finalTemperature, maxTokens, baseUrl, indent);

    case 'mistral':
      return generateMistralCode(varName, modelId, finalTemperature, maxTokens, indent);

    case 'llamaapi':
      return generateLlamaAPICode(varName, modelId, finalTemperature, maxTokens, indent);

    case 'llamacpp':
      return generateLlamaCppCode(varName, modelId, maxTokens, host, indent);

    case 'sagemaker':
      return generateSageMakerCode(varName, modelId, endpointName, region, indent);

    case 'writer':
      return generateWriterCode(varName, modelId, finalTemperature, maxTokens, indent);

    default:
      // For community providers, generate OpenAI-compatible pattern with custom import
      return generateGenericCode(varName, modelId, finalTemperature, maxTokens, provider, indent);
  }
}

// --- Provider-specific generators ---

function generateBedrockCode(varName: string, modelId: string, temperature: number, maxTokens: number, thinkingEnabled?: boolean, thinkingBudgetTokens?: number, region?: string, indent = ''): string {
  let code = `${indent}${varName}_model = BedrockModel(\n${indent}    model_id="${modelId}",\n${indent}    temperature=${temperature},\n${indent}    max_tokens=${maxTokens}`;

  if (region) {
    code += `,\n${indent}    region_name="${region}"`;
  }

  if (thinkingEnabled && thinkingBudgetTokens) {
    code += `,\n${indent}    additional_request_fields={\n${indent}        "thinking": {\n${indent}            "type": "enabled",\n${indent}            "budget_tokens": ${thinkingBudgetTokens}\n${indent}        }\n${indent}    }`;
  }

  code += `\n${indent})`;
  return code;
}

function generateOpenAICode(varName: string, modelId: string, temperature: number, maxTokens: number, baseUrl?: string, thinkingEnabled?: boolean, reasoningEffort?: string, providerId = 'openai', indent = ''): string {
  const envVar = getApiKeyEnvVar(providerId) || 'OPENAI_API_KEY';
  const clientArgs = [`"api_key": os.environ.get("${envVar}")`];
  if (baseUrl) {
    clientArgs.push(`"base_url": "${baseUrl}"`);
  }

  const params = [`"max_tokens": ${maxTokens}`, `"temperature": ${temperature}`];
  if (thinkingEnabled && reasoningEffort) {
    params.push(`"reasoning_effort": "${reasoningEffort}"`);
  }

  return `${indent}${varName}_model = OpenAIModel(
${indent}    client_args={
${indent}        ${clientArgs.join(',\n' + indent + '        ')}
${indent}    },
${indent}    model_id="${modelId}",
${indent}    params={
${indent}        ${params.join(',\n' + indent + '        ')},
${indent}    }
${indent})`;
}

function generateOpenAIResponsesCode(varName: string, modelId: string, temperature: number, maxTokens: number, baseUrl?: string, thinkingEnabled?: boolean, reasoningEffort?: string, indent = ''): string {
  const clientArgs = [`"api_key": os.environ.get("OPENAI_API_KEY")`];
  if (baseUrl) {
    clientArgs.push(`"base_url": "${baseUrl}"`);
  }

  let code = `${indent}${varName}_model = OpenAIResponsesModel(
${indent}    client_args={
${indent}        ${clientArgs.join(',\n' + indent + '        ')}
${indent}    },
${indent}    model_id="${modelId}"`;

  if (thinkingEnabled && reasoningEffort) {
    code += `,\n${indent}    reasoning={
${indent}        "effort": "${reasoningEffort}"
${indent}    }`;
  }

  code += `\n${indent})`;
  return code;
}

function generateAnthropicCode(varName: string, modelId: string, temperature: number, maxTokens: number, thinkingEnabled?: boolean, thinkingBudgetTokens?: number, indent = ''): string {
  let code = `${indent}${varName}_model = AnthropicModel(
${indent}    model_id="${modelId}",
${indent}    temperature=${temperature},
${indent}    max_tokens=${maxTokens}`;

  if (thinkingEnabled && thinkingBudgetTokens) {
    code += `,\n${indent}    thinking={
${indent}        "type": "enabled",
${indent}        "budget_tokens": ${thinkingBudgetTokens}
${indent}    }`;
  }

  code += `\n${indent})`;
  return code;
}

function generateGoogleCode(varName: string, modelId: string, temperature: number, maxTokens: number, indent = ''): string {
  return `${indent}${varName}_model = GoogleModel(
${indent}    model_id="${modelId}",
${indent}    temperature=${temperature},
${indent}    max_tokens=${maxTokens}
${indent})`;
}

function generateOllamaCode(varName: string, modelId: string, temperature: number, maxTokens: number, host?: string, indent = ''): string {
  let code = `${indent}${varName}_model = OllamaModel(
${indent}    model_id="${modelId}"`;

  if (host && host !== 'http://localhost:11434') {
    code += `,\n${indent}    host="${host}"`;
  }

  code += `\n${indent})`;
  return code;
}

function generateLiteLLMCode(varName: string, modelId: string, temperature: number, maxTokens: number, baseUrl?: string, indent = ''): string {
  let code = `${indent}${varName}_model = LiteLLMModel(
${indent}    model_id="${modelId}"`;

  if (baseUrl) {
    code += `,\n${indent}    api_base="${baseUrl}"`;
  }

  code += `\n${indent})`;
  return code;
}

function generateMistralCode(varName: string, modelId: string, temperature: number, maxTokens: number, indent = ''): string {
  return `${indent}${varName}_model = MistralModel(
${indent}    model_id="${modelId}",
${indent}    temperature=${temperature},
${indent}    max_tokens=${maxTokens}
${indent})`;
}

function generateLlamaAPICode(varName: string, modelId: string, temperature: number, maxTokens: number, indent = ''): string {
  return `${indent}${varName}_model = LlamaAPIModel(
${indent}    model_id="${modelId}",
${indent}    temperature=${temperature},
${indent}    max_tokens=${maxTokens}
${indent})`;
}

function generateLlamaCppCode(varName: string, modelId: string, maxTokens: number, host?: string, indent = ''): string {
  let code = `${indent}${varName}_model = LlamaCppModel(`;

  if (host && host !== 'http://localhost:8080') {
    code += `\n${indent}    host="${host}"`;
  }

  code += `\n${indent})`;
  return code;
}

function generateSageMakerCode(varName: string, modelId: string, endpointName?: string, region?: string, indent = ''): string {
  let code = `${indent}${varName}_model = SageMakerModel(
${indent}    endpoint_name="${endpointName || modelId}"`;

  if (region) {
    code += `,\n${indent}    region_name="${region}"`;
  }

  code += `\n${indent})`;
  return code;
}

function generateWriterCode(varName: string, modelId: string, temperature: number, maxTokens: number, indent = ''): string {
  return `${indent}${varName}_model = WriterModel(
${indent}    model_id="${modelId}",
${indent}    temperature=${temperature},
${indent}    max_tokens=${maxTokens}
${indent})`;
}

function generateGenericCode(varName: string, modelId: string, temperature: number, maxTokens: number, provider: any, indent = ''): string {
  return `${indent}${varName}_model = ${provider.className}(
${indent}    model_id="${modelId}",
${indent}    temperature=${temperature},
${indent}    max_tokens=${maxTokens}
${indent})`;
}
