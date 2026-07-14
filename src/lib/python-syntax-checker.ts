/**
 * Python Syntax Checker — Client-side AST validation for custom tools
 * 
 * Validates Python code structure without running it:
 * - Checks for @tool decorator
 * - Validates function definition (def keyword, proper syntax)
 * - Checks balanced brackets/parentheses/quotes
 * - Validates indentation structure
 * - Checks for common errors (missing colon, unmatched quotes)
 */

export interface SyntaxCheckResult {
  valid: boolean;
  errors: SyntaxError[];
  warnings: string[];
}

export interface SyntaxError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export function checkPythonSyntax(code: string): SyntaxCheckResult {
  const errors: SyntaxError[] = [];
  const warnings: string[] = [];

  if (!code || !code.trim()) {
    errors.push({ line: 1, message: 'No code provided', severity: 'error' });
    return { valid: false, errors, warnings };
  }

  const lines = code.split('\n');

  // Check for @tool decorator
  const hasToolDecorator = lines.some(l => l.trim().startsWith('@tool'));
  if (!hasToolDecorator) {
    warnings.push('Missing @tool decorator — function won\'t be registered as a Strands tool');
  }

  // Check for function definition
  const hasDef = lines.some(l => l.trim().startsWith('def '));
  if (!hasDef) {
    errors.push({ line: 1, message: 'No function definition found (missing "def")', severity: 'error' });
  }

  // Check balanced brackets
  let parenCount = 0;
  let bracketCount = 0;
  let braceCount = 0;

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    // Skip comments
    const codePart = line.split('#')[0];

    for (const ch of codePart) {
      if (ch === '(') parenCount++;
      if (ch === ')') parenCount--;
      if (ch === '[') bracketCount++;
      if (ch === ']') bracketCount--;
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }

    if (parenCount < 0) {
      errors.push({ line: lineNum, message: 'Unmatched closing parenthesis ")"', severity: 'error' });
      parenCount = 0;
    }
    if (bracketCount < 0) {
      errors.push({ line: lineNum, message: 'Unmatched closing bracket "]"', severity: 'error' });
      bracketCount = 0;
    }
    if (braceCount < 0) {
      errors.push({ line: lineNum, message: 'Unmatched closing brace "}"', severity: 'error' });
      braceCount = 0;
    }

    // Check for def/if/for/while without colon
    const trimmed = codePart.trim();
    if (/^(def |if |elif |else|for |while |class |try|except|finally|with )/.test(trimmed)) {
      if (!trimmed.endsWith(':') && !trimmed.endsWith(':\\') && trimmed.length > 0) {
        // Could be multi-line — only warn if line has balanced parens
        if (parenCount === 0 && !trimmed.endsWith(',') && !trimmed.endsWith('(')) {
          errors.push({ line: lineNum, message: `Statement may be missing a colon ":"`, severity: 'warning' });
        }
      }
    }

    // Check for inconsistent indentation (tabs mixed with spaces)
    if (line.startsWith('\t') && line.includes('    ')) {
      warnings.push(`Line ${lineNum}: Mixed tabs and spaces`);
    }
  });

  // Final balance check
  if (parenCount > 0) errors.push({ line: lines.length, message: `${parenCount} unclosed parenthesis "("`, severity: 'error' });
  if (bracketCount > 0) errors.push({ line: lines.length, message: `${bracketCount} unclosed bracket "["`, severity: 'error' });
  if (braceCount > 0) errors.push({ line: lines.length, message: `${braceCount} unclosed brace "{"`, severity: 'error' });

  // Check unmatched triple quotes
  const tripleDoubleCount = (code.match(/\"\"\"/g) || []).length;
  const tripleSingleCount = (code.match(/'''/g) || []).length;
  if (tripleDoubleCount % 2 !== 0) errors.push({ line: lines.length, message: 'Unmatched triple-double-quote (""")', severity: 'error' });
  if (tripleSingleCount % 2 !== 0) errors.push({ line: lines.length, message: "Unmatched triple-single-quote (''')", severity: 'error' });

  // Check return type annotation (best practice for tools)
  if (hasDef) {
    const defLine = lines.find(l => l.trim().startsWith('def '));
    if (defLine && !defLine.includes('->')) {
      warnings.push('Missing return type annotation — Strands tools should declare return type (e.g., -> dict)');
    }
  }

  // Check docstring (required for tools — LLM reads it)
  if (hasDef) {
    const defIndex = lines.findIndex(l => l.trim().startsWith('def '));
    const nextLine = lines[defIndex + 1]?.trim() || '';
    if (!nextLine.startsWith('"""') && !nextLine.startsWith("'''")) {
      warnings.push('Missing docstring — the LLM uses this to decide when to call the tool');
    }
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
  };
}
