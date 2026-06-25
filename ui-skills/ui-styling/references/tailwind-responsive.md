\# Tailwind CSS Responsive Design

Mobile-first breakpoints, responsive utilities, and adaptive layouts.

\## Mobile-First Approach

Tailwind uses mobile-first responsive design. Base styles apply to all screen sizes, then use breakpoint prefixes to override at larger sizes.

\`\`\`html

Item 1

Item 2

Item 3

Item 4

\`\`\`

\## Breakpoint System

\*\*Default breakpoints:\*\*

\| Prefix \| Min Width \| CSS Media Query \|
\|--------\|-----------\|-----------------\|
\| \`sm:\` \| 640px \| \`@media (min-width: 640px)\` \|
\| \`md:\` \| 768px \| \`@media (min-width: 768px)\` \|
\| \`lg:\` \| 1024px \| \`@media (min-width: 1024px)\` \|
\| \`xl:\` \| 1280px \| \`@media (min-width: 1280px)\` \|
\| \`2xl:\` \| 1536px \| \`@media (min-width: 1536px)\` \|

\## Responsive Patterns

\### Layout Changes

\`\`\`html

Left

Right

Item 1

Item 2

Item 3

\`\`\`

\### Visibility

\`\`\`html

Desktop only content

Mobile only content

Mobile menu

Desktop navigation

\`\`\`

\### Typography

\`\`\`html

# Heading scales with screen size

Body text scales appropriately

\`\`\`

\### Spacing

\`\`\`html

More padding on larger screens

Item 1

Item 2

\`\`\`

\### Width

\`\`\`html

Responsive width

Centered with responsive max width

\`\`\`

\## Common Responsive Layouts

\### Sidebar Layout

\`\`\`html

Main content


\`\`\`

\### Card Grid

\`\`\`html

Card 1

Card 2

Card 3

Card 4

\`\`\`

\### Hero Section

\`\`\`html

# Hero Title

Hero description


CTA Button


![](https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/.claude/skills/ui-styling/references/hero.jpg)

\`\`\`

\### Navigation

\`\`\`html

\`\`\`

\## Max-Width Queries

Apply styles only below certain breakpoint using \`max-\*:\` prefix:

\`\`\`html

Centered on mobile/tablet, left-aligned on desktop

Hidden only on mobile

\`\`\`

Available: \`max-sm:\` \`max-md:\` \`max-lg:\` \`max-xl:\` \`max-2xl:\`

\## Range Queries

Apply styles between breakpoints:

\`\`\`html

Visible only on tablets

2 columns on tablet, 4 on extra large

\`\`\`

\## Container Queries

Style elements based on parent container width:

\`\`\`html

Responds to parent width, not viewport


\`\`\`

Container query breakpoints: \`@sm:\` \`@md:\` \`@lg:\` \`@xl:\` \`@2xl:\`

\## Custom Breakpoints

Define custom breakpoints in theme:

\`\`\`css
@theme {
 --breakpoint-3xl: 120rem; /\* 1920px \*/
 --breakpoint-tablet: 48rem; /\* 768px \*/
}
\`\`\`

\`\`\`html

Uses custom breakpoints

\`\`\`

\## Responsive State Variants

Combine responsive with hover/focus:

\`\`\`html

 Scale on hover (desktop only)

 Link

\`\`\`

\## Best Practices

\### 1\. Mobile-First Design

Start with mobile styles, add complexity at larger breakpoints:

\`\`\`html

\`\`\`

\### 2\. Consistent Breakpoint Usage

Use same breakpoints across related elements:

\`\`\`html

Spacing scales with layout

\`\`\`

\### 3\. Test at Breakpoint Boundaries

Test at exact breakpoint widths (640px, 768px, 1024px, etc.) to catch edge cases.

\### 4\. Use Container for Content Width

\`\`\`html

Content with consistent max width


\`\`\`

\### 5\. Progressive Enhancement

Ensure core functionality works on mobile, enhance for larger screens:

\`\`\`html

Content


\`\`\`

\### 6\. Avoid Too Many Breakpoints

Use 2-3 breakpoints per element for maintainability:

\`\`\`html

\`\`\`

\## Common Responsive Utilities

\### Responsive Display

\`\`\`html

Changes display type per breakpoint

\`\`\`

\### Responsive Position

\`\`\`html

Positioned differently per breakpoint

\`\`\`

\### Responsive Order

\`\`\`html

First on desktop

First on mobile

\`\`\`

\### Responsive Overflow

\`\`\`html

Scrollable on mobile, expanded on desktop

\`\`\`

\## Testing Checklist

\- \[ \] Test at 320px (small mobile)
\- \[ \] Test at 640px (mobile breakpoint)
\- \[ \] Test at 768px (tablet breakpoint)
\- \[ \] Test at 1024px (desktop breakpoint)
\- \[ \] Test at 1280px (large desktop breakpoint)
\- \[ \] Test landscape orientation
\- \[ \] Verify touch targets (min 44x44px)
\- \[ \] Check text readability at all sizes
\- \[ \] Verify navigation works on mobile
\- \[ \] Test with browser zoom