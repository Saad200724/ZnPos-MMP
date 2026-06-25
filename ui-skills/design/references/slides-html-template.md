\# HTML Slide Template

Complete HTML structure with navigation, tokens, and Chart.js integration.

\## Base Structure

\`\`\`html



 Presentation Title

# Title Slide

Subtitle or tagline

←1 / 9→



\`\`\`

\## Chart.js Integration

\`\`\`html

\`\`\`

\## Animation Classes

\`\`\`css
/\\* Fade Up \*/
.animate-fade-up {
 animation: fadeUp 0.6s ease-out forwards;
 opacity: 0;
}
@keyframes fadeUp {
 from { opacity: 0; transform: translateY(30px); }
 to { opacity: 1; transform: translateY(0); }
}

/\\* Count Animation \*/
.animate-count { animation: countUp 1s ease-out forwards; }

/\\* Scale \*/
.animate-scale {
 animation: scaleIn 0.5s ease-out forwards;
}
@keyframes scaleIn {
 from { opacity: 0; transform: scale(0.9); }
 to { opacity: 1; transform: scale(1); }
}

/\\* Stagger Children \*/
.animate-stagger > \* {
 opacity: 0;
 animation: fadeUp 0.5s ease-out forwards;
}
.animate-stagger > \*:nth-child(1) { animation-delay: 0.1s; }
.animate-stagger > \*:nth-child(2) { animation-delay: 0.2s; }
.animate-stagger > \*:nth-child(3) { animation-delay: 0.3s; }
.animate-stagger > \*:nth-child(4) { animation-delay: 0.4s; }
\`\`\`

\## Background Images

\`\`\`html

\`\`\`

\## CSS Variables Reference

\| Variable \| Usage \|
\|----------\|-------\|
\| \`--color-primary\` \| Brand primary (CTA, highlights) \|
\| \`--color-background\` \| Slide background \|
\| \`--color-secondary\` \| Secondary elements \|
\| \`--primitive-gradient-primary\` \| Title gradients \|
\| \`--typography-font-heading\` \| Headlines \|
\| \`--typography-font-body\` \| Body text \|