\# shadcn/ui Accessibility Patterns

ARIA patterns, keyboard navigation, screen reader support, and accessible component usage.

\## Foundation: Radix UI Primitives

shadcn/ui built on Radix UI primitives - unstyled, accessible components following WAI-ARIA design patterns.

Benefits:
\- Keyboard navigation built-in
\- Screen reader announcements
\- Focus management
\- ARIA attributes automatically applied
\- Tested against accessibility standards

\## Keyboard Navigation

\### Focus Management

\*\*Focus visible states:\*\*
\`\`\`tsx

 Accessible Button

\`\`\`

\*\*Skip to content:\*\*
\`\`\`tsx
[Skip to content](https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/.claude/skills/ui-styling/references/shadcn-accessibility.md#main-content)
 {/\\* Content \*/}

\`\`\`

\### Dialog/Modal Navigation

Dialogs trap focus automatically via Radix Dialog primitive:

\`\`\`tsx
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

Open
 {/\\* Focus trapped here \*/}
  {/\\* Auto-focused \*/}
 Action
 {/\\* Esc to close, Tab to navigate \*/}

\`\`\`

Features:
\- Focus trapped within dialog
\- Esc key closes
\- Tab cycles through focusable elements
\- Focus returns to trigger on close

\### Dropdown/Menu Navigation

\`\`\`tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

OpenProfileSettingsLogout
\`\`\`

Keyboard shortcuts:
\- \`Space/Enter\`: Open menu
\- \`Arrow Up/Down\`: Navigate items
\- \`Esc\`: Close menu
\- \`Tab\`: Close and move focus

\### Command Palette Navigation

\`\`\`tsx
import { Command } from "@/components/ui/command"

CalendarSearch
\`\`\`

Features:
\- Type to filter
\- Arrow keys to navigate
\- Enter to select
\- Esc to close

\## Screen Reader Support

\### Semantic HTML

Use proper HTML elements:

\`\`\`tsx
// Good: Semantic HTML
Click me

// Avoid: Div soup

Click me

\`\`\`

\### ARIA Labels

\*\*Label interactive elements:\*\*
\`\`\`tsx

\`\`\`

\*\*Describe elements:\*\*
\`\`\`tsx

 Delete Account

This action permanently deletes your account and cannot be undone

\`\`\`

\### Screen Reader Only Text

Use \`sr-only\` class for screen reader only content:

\`\`\`tsx
Delete item

// CSS for sr-only
.sr-only {
 position: absolute;
 width: 1px;
 height: 1px;
 padding: 0;
 margin: -1px;
 overflow: hidden;
 clip: rect(0, 0, 0, 0);
 white-space: nowrap;
 border-width: 0;
}
\`\`\`

\### Live Regions

Announce dynamic content:

\`\`\`tsx

{message}

// For urgent updates

{error}

\`\`\`

Toast component includes live region:
\`\`\`tsx
const { toast } = useToast()

toast({
 title: "Success",
 description: "Profile updated"
})
// Announced to screen readers automatically
\`\`\`

\## Form Accessibility

\### Labels and Descriptions

\*\*Always label inputs:\*\*
\`\`\`tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

Email

\`\`\`

\*\*Add descriptions:\*\*
\`\`\`tsx
import { FormDescription, FormMessage } from "@/components/ui/form"

Username
 Your public display name
  {/\\* Error messages \*/}

\`\`\`

\### Error Handling

Announce errors to screen readers:

\`\`\`tsx
 (
 Email
 )}
/>
\`\`\`

\### Required Fields

Indicate required fields:

\`\`\`tsx

 Name \*(required)
\`\`\`

\### Fieldset and Legend

Group related fields:

\`\`\`tsx

 Contact Information


\`\`\`

\## Component-Specific Patterns

\### Accordion

\`\`\`tsx
import { Accordion } from "@/components/ui/accordion"

 {/\\* Includes aria-expanded, aria-controls automatically \*/}
 Is it accessible?

 {/\\* Hidden when collapsed, announced when expanded \*/}
 Yes. Follows WAI-ARIA design pattern.

\`\`\`

\### Tabs

\`\`\`tsx
import { Tabs } from "@/components/ui/tabs"

 {/\\* Arrow keys navigate, Space/Enter activates \*/}
 AccountPassword
 {/\\* Hidden unless selected, aria-labelledby links to trigger \*/}
 Account content

\`\`\`

\### Select

\`\`\`tsx
import { Select } from "@/components/ui/select"





 {/\\* Keyboard navigable, announced to screen readers \*/}
 Light
 Dark


\`\`\`

\### Checkbox and Radio

\`\`\`tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

Accept terms

You agree to our Terms of Service and Privacy Policy

\`\`\`

\### Alert

\`\`\`tsx
import { Alert } from "@/components/ui/alert"

 {/\\* Announced immediately to screen readers \*/}
 Error
 Your session has expired

\`\`\`

\## Color Contrast

Ensure sufficient contrast between text and background.

\*\*WCAG Requirements:\*\*
\- \*\*AA\*\*: 4.5:1 for normal text, 3:1 for large text
\- \*\*AAA\*\*: 7:1 for normal text, 4.5:1 for large text

\*\*Check defaults:\*\*
\`\`\`tsx
// Good: High contrast

Text

// Avoid: Low contrast

Hard to read

\`\`\`

\*\*Muted text:\*\*
\`\`\`tsx
// Use semantic muted foreground

Secondary text with accessible contrast

\`\`\`

\## Focus Indicators

Always provide visible focus indicators:

\*\*Default focus ring:\*\*
\`\`\`tsx

 Button

\`\`\`

\*\*Custom focus styles:\*\*
\`\`\`tsx
[Link](https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/.claude/skills/ui-styling/references/shadcn-accessibility.md#)
\`\`\`

\*\*Don't remove focus styles:\*\*
\`\`\`tsx
// Avoid
Bad

// Use focus-visible instead
Good
\`\`\`

\## Motion and Animation

Respect reduced motion preference:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
 \\* {
 animation-duration: 0.01ms !important;
 animation-iteration-count: 1 !important;
 transition-duration: 0.01ms !important;
 }
}
\`\`\`

In components:
\`\`\`tsx

Respects user preference

\`\`\`

\## Testing Checklist

\- \[ \] All interactive elements keyboard accessible
\- \[ \] Focus indicators visible
\- \[ \] Screen reader announces all content correctly
\- \[ \] Form errors announced and associated
\- \[ \] Color contrast meets WCAG AA
\- \[ \] Semantic HTML used
\- \[ \] ARIA labels provided for icon-only buttons
\- \[ \] Modal/dialog focus trap works
\- \[ \] Dropdown/select keyboard navigable
\- \[ \] Live regions announce updates
\- \[ \] Respects reduced motion preference
\- \[ \] Works with browser zoom up to 200%
\- \[ \] Tab order logical
\- \[ \] Skip links provided for navigation

\## Tools

\*\*Testing tools:\*\*
\- Lighthouse accessibility audit
\- axe DevTools browser extension
\- NVDA/JAWS screen readers
\- Keyboard-only navigation testing
\- Color contrast checkers (Contrast Ratio, WebAIM)

\*\*Automated testing:\*\*
\`\`\`bash
npm install -D @axe-core/react
\`\`\`

\`\`\`tsx
import { useEffect } from 'react'

if (process.env.NODE\_ENV === 'development') {
 import('@axe-core/react').then((axe) => {
 axe.default(React, ReactDOM, 1000)
 })
}
\`\`\`