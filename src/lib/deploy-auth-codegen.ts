/**
 * Auth Config for Deployments — IAM Role, Cognito, API Key
 * Adds authentication to generated deployment configurations.
 */

export interface DeployAuthConfig {
  authType: 'none' | 'iam_role' | 'cognito' | 'api_key';
  // IAM
  iamRoleArn?: string;
  // Cognito
  cognitoUserPoolId?: string;
  cognitoClientId?: string;
  cognitoRegion?: string;
  // API Key
  apiKeyHeaderName?: string;
  apiKeyEnvVar?: string;
}

/**
 * Generate auth configuration for CloudFormation/SAM templates.
 */
export function generateDeployAuthCode(config: DeployAuthConfig): string {
  if (config.authType === 'none') return '';

  const lines: string[] = [];
  lines.push('# Authentication Configuration');

  switch (config.authType) {
    case 'iam_role':
      lines.push(`# IAM Role-based authentication`);
      lines.push(`# Callers must sign requests with SigV4`);
      if (config.iamRoleArn) {
        lines.push(`AUTHORIZED_ROLE_ARN = "${config.iamRoleArn}"`);
      } else {
        lines.push(`# Set IAM_ROLE_ARN env var for the authorized caller role`);
        lines.push(`AUTHORIZED_ROLE_ARN = os.environ.get("IAM_ROLE_ARN", "")`);
      }
      break;

    case 'cognito':
      lines.push(`# Amazon Cognito authentication`);
      lines.push(`COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "${config.cognitoUserPoolId || ''}")`);
      lines.push(`COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "${config.cognitoClientId || ''}")`);
      lines.push(`COGNITO_REGION = "${config.cognitoRegion || 'us-east-1'}"`);
      break;

    case 'api_key':
      const header = config.apiKeyHeaderName || 'x-api-key';
      const envVar = config.apiKeyEnvVar || 'AGENT_API_KEY';
      lines.push(`# API Key authentication`);
      lines.push(`API_KEY_HEADER = "${header}"`);
      lines.push(`API_KEY = os.environ.get("${envVar}", "")`);
      lines.push(``);
      lines.push(`def validate_api_key(request_headers: dict) -> bool:`);
      lines.push(`    """Validate API key from request headers."""`);
      lines.push(`    provided_key = request_headers.get("${header}", "")`);
      lines.push(`    return provided_key == API_KEY and API_KEY != ""`);
      break;
  }

  return lines.join('\n');
}
