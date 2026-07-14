/**
 * Observability Code Generator — Generates Python code for tracing/monitoring configuration
 *
 * Handles:
 * - OpenTelemetry tracing toggle (OTEL_EXPORTER_OTLP_ENDPOINT env var)
 * - Exporter type (OTLP/gRPC, OTLP/HTTP, Console, None)
 * - Service name configuration
 * - Trace sampling rate
 * - Custom span attributes
 *
 * Based on Strands Agents SDK:
 * https://strandsagents.com/docs/user-guide/observability-evaluation/observability/
 *
 * Security:
 * - Endpoint URLs sanitized before codegen
 * - No auth tokens hardcoded — env var references only
 * - Service names validated (alphanumeric + hyphens)
 */

export interface ObservabilityCodeOptions {
  // OpenTelemetry
  otelEnabled?: boolean;
  otelExporterType?: 'otlp_grpc' | 'otlp_http' | 'console' | 'none';
  otelEndpoint?: string;
  otelServiceName?: string;
  otelSamplingRate?: number; // 0.0 to 1.0
  otelHeaders?: string; // comma-separated key=value pairs for auth
  // Agent SOPs
  agentSopEnabled?: boolean;
  agentSopContent?: string; // Markdown content
}

function sanitizeServiceName(name: string): string {
  return (name || 'strands-agent').replace(/[^a-zA-Z0-9\-_.]/g, '-').toLowerCase();
}

function sanitizeUrl(url: string): string {
  if (!url) return '';
  // Basic URL validation — only allow http/https/grpc schemes
  if (/^(https?|grpc):\/\//i.test(url)) {
    return url.replace(/"/g, '').replace(/'/g, '');
  }
  return '';
}

/**
 * Generate import statements for observability configuration.
 */
export function generateObservabilityImports(data: ObservabilityCodeOptions): string[] {
  const imports: string[] = [];

  if (data.otelEnabled) {
    // Strands SDK uses env vars for OTEL — no explicit imports needed for basic tracing
    // But for custom instrumentation, we add opentelemetry imports
    if (data.otelExporterType === 'console') {
      imports.push('from opentelemetry import trace');
      imports.push('from opentelemetry.sdk.trace import TracerProvider');
      imports.push('from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor');
    }
  }

  return imports;
}

/**
 * Generate environment variable setup code for OTEL.
 * Strands SDK auto-instruments when OTEL env vars are set.
 */
export function generateOtelSetupCode(data: ObservabilityCodeOptions): string {
  if (!data.otelEnabled) {
    return '';
  }

  const lines: string[] = [];
  lines.push(`# OpenTelemetry — Distributed Tracing Configuration`);
  lines.push(`# Strands SDK auto-instruments agent loops when OTEL is configured`);

  const serviceName = sanitizeServiceName(data.otelServiceName || 'strands-agent');
  lines.push(`os.environ.setdefault("OTEL_SERVICE_NAME", "${serviceName}")`);

  if (data.otelExporterType === 'otlp_grpc' || data.otelExporterType === 'otlp_http') {
    const endpoint = sanitizeUrl(data.otelEndpoint || '');
    const protocol = data.otelExporterType === 'otlp_grpc' ? 'grpc' : 'http/protobuf';

    lines.push(`os.environ.setdefault("OTEL_EXPORTER_OTLP_PROTOCOL", "${protocol}")`);

    if (endpoint) {
      lines.push(`os.environ.setdefault("OTEL_EXPORTER_OTLP_ENDPOINT", "${endpoint}")`);
    } else {
      lines.push(`# Set OTEL_EXPORTER_OTLP_ENDPOINT env var to your collector (e.g., http://localhost:4317)`);
    }

    if (data.otelHeaders) {
      // Headers reference env var — never hardcode auth tokens
      lines.push(`# Auth headers — set via OTEL_EXPORTER_OTLP_HEADERS env var`);
      lines.push(`# Example: OTEL_EXPORTER_OTLP_HEADERS="x-api-key=YOUR_KEY"`);
    }
  } else if (data.otelExporterType === 'console') {
    lines.push(`os.environ.setdefault("OTEL_TRACES_EXPORTER", "console")`);
  }

  if (data.otelSamplingRate !== undefined && data.otelSamplingRate < 1.0) {
    lines.push(`os.environ.setdefault("OTEL_TRACES_SAMPLER", "traceidratio")`);
    lines.push(`os.environ.setdefault("OTEL_TRACES_SAMPLER_ARG", "${data.otelSamplingRate}")`);
  }

  lines.push(`os.environ.setdefault("STRANDS_OTEL_ENABLE_TRACING", "true")`);

  return lines.join('\n');
}

/**
 * Generate Agent SOP code.
 * SOPs are markdown-based workflow definitions passed as system prompt extensions.
 */
export function generateAgentSopCode(data: ObservabilityCodeOptions): string {
  if (!data.agentSopEnabled || !data.agentSopContent) {
    return '';
  }

  // Escape the markdown content for Python triple-quoted strings
  const escapedContent = (data.agentSopContent || '')
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '\\"\\"\\"');

  const lines: string[] = [];
  lines.push(`# Agent SOP — Natural Language Workflow Definition`);
  lines.push(`AGENT_SOP = """`);
  lines.push(escapedContent);
  lines.push(`"""`);
  lines.push(``);

  return lines.join('\n');
}

/**
 * Get the SOP system prompt extension kwarg.
 * This appends the SOP to the agent's system prompt.
 */
export function getSopSystemPromptExtension(data: ObservabilityCodeOptions): string {
  if (!data.agentSopEnabled || !data.agentSopContent) {
    return '';
  }

  return `\n\n## Standard Operating Procedure\n\n" + AGENT_SOP + "`;
}
