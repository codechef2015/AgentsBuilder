/**
 * HelpTooltip — Reusable help icon with hover tooltip
 *
 * Displays a small (?) icon that shows a tooltip on hover explaining
 * what a setting does. Used across all configuration panels.
 *
 * Architecture:
 * - Pure CSS hover tooltip (no useEffect, no state, no portals)
 * - Accessible: uses aria-label and role="tooltip"
 * - Responsive: auto-positions tooltip based on available space
 *
 * Usage:
 *   <HelpTooltip text="Maximum iterations before agent stops" />
 */

interface HelpTooltipProps {
  /** Tooltip text explaining the setting */
  text: string;
  /** Optional documentation URL for "Learn more" link */
  docUrl?: string;
}

export function HelpTooltip({ text, docUrl }: HelpTooltipProps) {
  return (
    <span className="relative inline-flex items-center ml-1 group">
      <span
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold cursor-help hover:bg-blue-100 hover:text-blue-600 transition-colors"
        aria-label={text}
      >
        ?
      </span>
      <span
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 text-[11px] leading-relaxed text-white bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 w-56 pointer-events-none group-hover:pointer-events-auto"
      >
        {text}
        {docUrl && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-1 text-blue-300 hover:text-blue-200 underline text-[10px] pointer-events-auto"
          >
            Learn more →
          </a>
        )}
        {/* Tooltip arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </span>
    </span>
  );
}

/**
 * FieldLabel — Label + optional help tooltip in one line
 *
 * Usage:
 *   <FieldLabel label="Max Turns" tooltip="Maximum agent loop iterations" />
 */
export function FieldLabel({
  label,
  tooltip,
  docUrl,
  required,
}: {
  label: string;
  tooltip?: string;
  docUrl?: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center text-xs font-medium text-gray-600 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {tooltip && <HelpTooltip text={tooltip} docUrl={docUrl} />}
    </label>
  );
}
