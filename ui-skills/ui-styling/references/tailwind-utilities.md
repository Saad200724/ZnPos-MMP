\# Tailwind CSS Utility Reference

Core utility classes for layout, spacing, typography, colors, borders, and shadows.

\## Layout Utilities

\### Display

\`\`\`html

Block

Inline Block

Inline

Flexbox

Inline Flex

Grid

Inline Grid

Hidden

\`\`\`

\### Flexbox

\*\*Container:\*\*
\`\`\`html

Row (default)

Column

Reverse row

Reverse column

\`\`\`

\*\*Justify (main axis):\*\*
\`\`\`html

Start

Center

End

Space between

Space around

Space evenly

\`\`\`

\*\*Align (cross axis):\*\*
\`\`\`html

Start

Center

End

Baseline

Stretch

\`\`\`

\*\*Gap:\*\*
\`\`\`html

All sides

X and Y

\`\`\`

\*\*Wrap:\*\*
\`\`\`html

Wrap

No wrap

\`\`\`

\### Grid

\*\*Columns:\*\*
\`\`\`html

1 column

2 columns

3 columns

4 columns

12 columns

Custom

\`\`\`

\*\*Rows:\*\*
\`\`\`html

3 rows

Custom

\`\`\`

\*\*Span:\*\*
\`\`\`html

Span 2 columns

Span 3 rows

\`\`\`

\*\*Gap:\*\*
\`\`\`html

All sides

X and Y

\`\`\`

\### Positioning

\`\`\`html

Static (default)

Relative

Absolute

Fixed

Sticky

Top right

All sides 0

Left/right 4

Top/bottom 8

\`\`\`

\### Z-Index

\`\`\`html

z-index: 0

z-index: 10

z-index: 20

z-index: 50

\`\`\`

\## Spacing Utilities

\### Padding

\`\`\`html

All sides

Left and right

Top and bottom

Top

Right

Bottom

Left

\`\`\`

\### Margin

\`\`\`html

All sides

Center horizontally

Top and bottom

Top

Negative top

Push to right

\`\`\`

\### Space Between

\`\`\`html

Horizontal spacing

Vertical spacing

\`\`\`

\### Spacing Scale

\- \`0\`: 0px
\- \`px\`: 1px
\- \`0.5\`: 0.125rem (2px)
\- \`1\`: 0.25rem (4px)
\- \`2\`: 0.5rem (8px)
\- \`3\`: 0.75rem (12px)
\- \`4\`: 1rem (16px)
\- \`6\`: 1.5rem (24px)
\- \`8\`: 2rem (32px)
\- \`12\`: 3rem (48px)
\- \`16\`: 4rem (64px)
\- \`24\`: 6rem (96px)

\## Typography

\### Font Size

\`\`\`html

Extra small (12px)

Small (14px)

Base (16px)

Large (18px)

XL (20px)

2XL (24px)

3XL (30px)

4XL (36px)

5XL (48px)

\`\`\`

\### Font Weight

\`\`\`html

Thin (100)

Light (300)

Normal (400)

Medium (500)

Semibold (600)

Bold (700)

Black (900)

\`\`\`

\### Text Alignment

\`\`\`html

Left

Center

Right

Justify

\`\`\`

\### Line Height

\`\`\`html

1

1.25

1.5

1.75

2

\`\`\`

\### Combined Font Utilities

\`\`\`html

# Font size 4xl with tight line height

\`\`\`

\### Text Transform

\`\`\`html

UPPERCASE

lowercase

Capitalize

Normal

\`\`\`

\### Text Decoration

\`\`\`html

Underline

Line through

No underline

\`\`\`

\### Text Overflow

\`\`\`html

Truncate with ellipsis...

Clamp to 3 lines...

Ellipsis

\`\`\`

\## Colors

\### Text Colors

\`\`\`html

Black

White

Gray 500

Red 600

Blue 500

Green 600

\`\`\`

\### Background Colors

\`\`\`html

White

Gray 100

Blue 500

Red 600

\`\`\`

\### Color Scale

Each color has 11 shades (50-950):
\- \`50\`: Lightest
\- \`100-400\`: Light variations
\- \`500\`: Base color
\- \`600-800\`: Dark variations
\- \`950\`: Darkest

\### Opacity Modifiers

\`\`\`html

75% opacity

30% opacity

87% opacity

\`\`\`

\### Gradients

\`\`\`html

Left to right gradient

With via color

\`\`\`

Directions: \`to-t \| to-tr \| to-r \| to-br \| to-b \| to-bl \| to-l \| to-tl\`

\## Borders

\### Border Width

\`\`\`html

1px all sides

2px all sides

Top only

Right 4px

Bottom 2px

Left only

No border

\`\`\`

\### Border Color

\`\`\`html

Gray

Blue

Red with opacity

\`\`\`

\### Border Radius

\`\`\`html

0.25rem

0.375rem

0.5rem

0.75rem

1rem

9999px

Top corners

Bottom right

\`\`\`

\### Border Style

\`\`\`html

Solid

Dashed

Dotted

\`\`\`

\## Shadows

\`\`\`html

Small

Default

Medium

Large

Extra large

2XL

No shadow

\`\`\`

\### Colored Shadows

\`\`\`html

Blue shadow

\`\`\`

\## Width & Height

\### Width

\`\`\`html

100%

50%

33.333%

16rem

500px

100vw

min-width: 0

max-width: 28rem

max-width: 1280px

\`\`\`

\### Height

\`\`\`html

100%

100vh

16rem

500px

min-height: 100vh

max-height: 24rem

\`\`\`

\## Arbitrary Values

Use square brackets for custom values:

\`\`\`html

Custom padding

Custom position

Hex color

RGB

Custom width

Custom font size

CSS var

Custom grid

\`\`\`

\## Aspect Ratio

\`\`\`html

1:1

16:9

4:3

\`\`\`

\## Overflow

\`\`\`html

Auto scroll

Hidden

Always scroll

Horizontal scroll

No vertical scroll

\`\`\`

\## Opacity

\`\`\`html

0%

50%

75%

100%

\`\`\`

\## Cursor

\`\`\`html

Pointer

Wait

Not allowed

Default

\`\`\`

\## User Select

\`\`\`html

No select

Text selectable

Select all

\`\`\`