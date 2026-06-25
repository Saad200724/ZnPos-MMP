\# shadcn/ui Component Reference

Complete catalog of shadcn/ui components with usage patterns and installation.

\## Installation

\*\*Add specific components:\*\*
\`\`\`bash
npx shadcn@latest add button
npx shadcn@latest add button card dialog # Multiple
npx shadcn@latest add --all # All components
\`\`\`

Components install to \`components/ui/\` with automatic dependency management.

\## Form & Input Components

\### Button
\`\`\`tsx
import { Button } from "@/components/ui/button"

DefaultDeleteSmall OutlineLink Style
\`\`\`

Variants: \`default \| destructive \| outline \| secondary \| ghost \| link\`
Sizes: \`default \| sm \| lg \| icon\`

\### Input
\`\`\`tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

Email

\`\`\`

\### Form (with React Hook Form + Zod)
\`\`\`tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import \* as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
 username: z.string().min(2).max(50),
 email: z.string().email()
})

function ProfileForm() {
 const form = useForm({
 resolver: zodResolver(schema),
 defaultValues: { username: "", email: "" }
 })

 return (
  (
 Username
 )} />
 Submit


 )
}
\`\`\`

\### Select
\`\`\`tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"





 Light
 Dark
 System


\`\`\`

\### Checkbox
\`\`\`tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

Accept terms

\`\`\`

\### Radio Group
\`\`\`tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

Option One

Option Two

\`\`\`

\### Textarea
\`\`\`tsx
import { Textarea } from "@/components/ui/textarea"