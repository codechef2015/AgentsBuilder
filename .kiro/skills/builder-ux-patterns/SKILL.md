---
name: builder-ux-patterns
description: "UX patterns for visual builder/studio applications (drag-drop editors, node-based UIs, flow editors). Covers micro-interactions, affordance design, contextual help, progressive disclosure, empty states, keyboard navigation, and production-grade component patterns for React + Tailwind + XYFlow. Use when improving visual editors, fixing UX friction, adding polish, or reviewing builder UI code."
---

# Builder UX Patterns

## Purpose

Design patterns specifically for visual builder/studio applications — drag-drop editors, node-based UIs, flow editors, configuration panels. These patterns make complex tools feel intuitive.

## When to Use

- Improving node-based flow editor UX
- Adding micro-interactions and affordances
- Implementing contextual help and progressive disclosure
- Fixing drag-drop, connection, and selection UX
- Adding keyboard shortcuts and accessibility
- Polishing empty states, loading states, error states
- Reviewing builder UI code for friction points

## Core Principles for Builder UX

### 1. Progressive Disclosure
Show only what's needed at each step. Don't overwhelm first-time users.

```
Level 0: Empty canvas → Clear CTA ("Drag an Agent here to start")
Level 1: One node placed → Show connection hints
Level 2: Connected nodes → Show "Run" button
Level 3: Executed → Show history, deploy options
```

### 2. Direct Manipulation
Everything users can see, they should be able to interact with directly.

| Element | Affordance | Feedback |
|---------|-----------|----------|
| Node | Grab cursor on hover | Shadow + lift on drag |
| Handle | Glow + pulse on hover | Elastic line while dragging |
| Edge | Click to select | Highlight + delete icon |
| Canvas | Pan with drag | Subtle grid movement |
| Panel | Resize handle | Cursor change + ghost line |

### 3. Contextual Help (not documentation)
Help should appear WHERE the user needs it, WHEN they need it.

```tsx
// ❌ Bad: External docs link
<a href="/docs/agents">Learn about agents</a>

// ✅ Good: Inline tooltip on the input
<FieldLabel
  label="Temperature"
  tooltip="Controls randomness. 0=deterministic, 1=creative. Most tasks work well at 0.7"
/>
```

### 4. Forgiving Interactions
Allow undo, provide clear exit paths, and never punish mistakes.

| Action | Forgiveness |
|--------|-------------|
| Delete node | Undo toast (5s window) |
| Invalid connection | Toast explaining why + suggestion |
| Unsaved work | Auto-save every 500ms + recovery |
| Wrong panel | Easy close (click outside / Esc) |

### 5. Visual Hierarchy in Panels
Configuration panels must guide the eye top-to-bottom.

```
┌─ Panel ──────────────────────┐
│ ★ Primary config (always visible)    │  ← Name, Model, System Prompt
│                                       │
│ ▸ Advanced (collapsed by default)     │  ← Retry, Session, Limits
│ ▸ Safety (collapsed)                  │  ← Guardrails
│ ▸ Observability (collapsed)           │  ← OTEL, SOPs
│ ▸ Plugins (collapsed)                 │  ← Memory, HITL, Tools
└───────────────────────────────────────┘
```

## Component Patterns (React + Tailwind)

### Collapsible Section with Badge
```tsx
<CollapsibleSection
  title="Guardrails"
  badge={isEnabled ? "ON" : undefined}
  icon={Shield}
  expanded={false}
  onToggle={() => toggle('guardrails')}
>
  {/* Content */}
</CollapsibleSection>
```

### Field with Tooltip
```tsx
<div>
  <FieldLabel
    label="Max Turns"
    tooltip="Maximum agent loop iterations before stopping"
    docUrl="https://strandsagents.com/..."
    required
  />
  <input type="number" ... />
</div>
```

### Empty State
```tsx
{items.length === 0 && (
  <div className="text-center py-8">
    <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
    <p className="text-sm text-gray-500 font-medium">No items yet</p>
    <p className="text-xs text-gray-400 mt-1">Click + to add your first item</p>
  </div>
)}
```

### Toast Notification (non-blocking)
```tsx
toast({ title: 'Saved', variant: 'success' });
toast({ title: 'Connection failed', description: 'Agents cannot connect to themselves', variant: 'error' });
```

### Keyboard Shortcut Discovery
```
Bottom toolbar → ⌨️ button → floating panel with all shortcuts
NOT a separate page. NOT a modal that blocks work.
```

## Node Design Language

### Visual Hierarchy in Nodes
```
┌─ Node ─────────────────────────┐
│ [Icon] Label              [×]  │  ← Header: type identity + delete
├────────────────────────────────┤
│ Key info at a glance           │  ← Model, temperature, badges
│ ⚡Stream  🛡️Safe  🧠Memory     │  ← Feature badges (small pills)
│ ─────── temp bar ────────────  │  ← Visual indicator
└────────────────────────────────┘
  ● Input handle (labeled)
  ● Output handle (labeled)
```

### Handle Labels
Always label handles. Users shouldn't guess what connects where.
```
"Input" (green) — user prompt goes in
"Tools" (orange) — tool nodes connect here
"Output" (indigo) — response comes out
```

### Node Color System
| Node Type | Header Color | Handle Color |
|-----------|-------------|--------------|
| Agent | blue-50 | green (in), indigo (out) |
| Orchestrator | purple-50 | purple |
| Swarm | emerald-50 | emerald |
| Input | green-50 | green |
| Output | red-50 | red |
| Tool | orange-50 | orange |
| MCP | indigo-50 | indigo |
| A2A | sky-50 | sky |
| Workflow | amber-50 | amber |

## Micro-Interactions Checklist

For every interactive element, define:

- [ ] **Hover state** — cursor change, color shift, or subtle scale
- [ ] **Focus state** — visible ring (a11y), not just color
- [ ] **Active/pressed state** — scale down or darken
- [ ] **Disabled state** — reduced opacity + not-allowed cursor + tooltip explaining WHY
- [ ] **Loading state** — spinner or skeleton, never frozen UI
- [ ] **Success state** — brief green flash or checkmark
- [ ] **Error state** — red border + inline message (not alert)

## Accessibility Requirements

### Keyboard Navigation
- `Tab` moves between panels/sections
- `Arrow keys` within panel fields
- `Escape` closes current panel/modal
- `Ctrl+S` saves project
- `Delete/Backspace` removes selected node
- `Ctrl+Z` undo (future)

### Screen Reader
- Every icon-only button: `aria-label`
- Every panel section: proper heading hierarchy
- Every tooltip: `role="tooltip"` with `aria-describedby`
- Every modal: `role="dialog"` + `aria-modal="true"` + focus trap

### Color Contrast
- All text: minimum 4.5:1 ratio (AA)
- Interactive elements: minimum 3:1
- Never use color alone to convey information (always pair with icon/text)

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| `alert()` for feedback | Toast notification |
| `confirm()` for destructive actions | Styled modal with clear consequences |
| Tooltip with 200+ words | Link to docs page |
| Required field without visual indicator | Red asterisk + "(required)" label |
| Collapsed-by-default PRIMARY config | Only collapse ADVANCED options |
| Icon-only button without label | Add `aria-label` + show label on hover |
| Saving without feedback | Toast + timestamp + subtle animation |
| Error without recovery path | Error + suggestion + retry button |
| Loading without progress | Skeleton or spinner with estimate |
| Form submission blocking UI | Optimistic update + background save |
