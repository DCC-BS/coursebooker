# Coursebook - Agent Coding Guidelines

## Build, Lint, and Test Commands

### Development
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run generate` - Generate static site

### Code Quality
- `bun run check` - Run Biome linter and auto-fix issues (run before committing)
- `bun run lint` - Format code with Biome

### Database
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio for database inspection
- `bun run db:generate` - Generate migration file from schema changes
- `bun run db:migrate` - Apply migrations

### Docker
- `bun run docker:dev` - Start with Docker Compose
- `bun run docker:dev:down` - Stop and remove Docker containers

**Note:** This project uses Biome for linting and formatting. No separate test framework is configured.

---

## Code Style Guidelines

### Language & Framework
- **All code must be TypeScript** - No implicit `any` allowed
- Use Vue 3 **Composition API** exclusively (`<script setup lang="ts">`)
- Use **Nuxt 3** with the `app/` directory structure
- Use **Biome** for formatting and linting (4 spaces, double quotes)

### Import Organization
Imports are auto-organized by Biome. Manual organization follows this order:
1. External packages
2. Internal imports using aliases
3. Relative imports (if necessary)

**Import Aliases:**
- `~/` - Points to `app/` directory
- `~~/` - Points to root directory
- `~~/server` - Points to `server/` directory
- `#shared` - Shared code (client & server)

```ts
// ✅ Right
import { AnimatePresence, motion } from "motion-v";
import { useI18n } from "#i18n";
import { useCourses } from "~/composables/useCourses";
import { useDb } from "~~/server/composables/useDb";

// ❌ Wrong - relative paths
import { useCourses } from "../../composables/useCourses";
```

### Naming Conventions

**File Naming:**
- **Components:** PascalCase - `UserCard.vue`, `AdminCourseForm.vue`
- **Pages:** kebab-case - `user-profile.vue`, `admin/courses.vue`
- **Other TypeScript files:** camelCase - `useApiFetch.ts`, `course.utils.ts`
- **Server API files:** kebab-case - `me.get.ts`, `courses.post.ts`

**Code Naming:**
- **Composables:** `use` prefix - `useCourses()`, `useApiFetch()`
- **Functions:** Standard function declarations - `function formatDate() { ... }`
- **Variables:** camelCase - `const userData = ...`, `const isLoading = false`

### Type Safety & Validation
- **Use `unknown` for error handling**, then validate with `instanceof` checks:
```ts
try {
  // ...
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```
- **Use `never` for unreachable code paths**
- **Define types in `shared/models/`** and export as `export type Foo = z.infer<typeof fooSchema>`
- **Use Zod schemas** for validation (defined in `shared/models/`)

### Component Structure
- Use `<script setup lang="ts">` for all Vue components
- Props defined with `defineProps<{ ... }>()` or `defineProps<Props>()`
- Use `computed()` for derived state
- Use `ref()` for reactive primitives
- Handle errors with `try/catch` blocks in async functions

### Styling
- Use **Tailwind CSS** for all styling
- Use **@nuxt/ui** components (`UButton`, `UForm`, etc.)
- Use **Lucide icons** via `UIcon name="i-lucide-*"` component

### Forms
- Use **@formkit/nuxt** with **Zod schemas** for form validation
- Use `<UForm :state="form" :schema="schema" @submit="...">` pattern
- Handle submission with `FormSubmitEvent<T>` type

### API Routes
- Define routes in `server/api/` with `defineEventHandler()`
- Name files by HTTP method: `me.get.ts`, `courses.post.ts`, `[id].patch.ts`
- Use Drizzle ORM for database queries via `useDb()` composable
- Throw errors with `createError({ statusCode, statusMessage })`

### Composables
- Place Vue reactivity-dependent composables in `app/composables/`
- Name all composables with `use` prefix
- Return reactive refs and functions from composables:
```ts
export function useCounter() {
    const count = ref(0);
    function increment() {
        count.value++;
    }
    return { count, increment };
}
```

### Utilities vs Services
- **Utils (`app/utils/`, `server/utils/`)**: Framework-agnostic helper functions
- **Services (`app/services/`)**: Business logic, API communication

### Server-Side vs Client-Side
- **Client code**: `app/` directory - composables, components, pages
- **Server code**: `server/` directory - API routes, server utils, plugins
- **Shared code**: `shared/` directory - types, schemas used by both

### Database
- Use **Drizzle ORM** with schema from `shared/schema/`
- Schema changes: Edit schema files, then run `bun run db:generate`
- Use `useDb()` composable to access database in server code
- Database migrations auto-run via `server/plugins/migrateDb.ts` plugin

---

## Folder Structure Overview

```
app/
 ├─ components/          # Vue components (PascalCase)
 │   └─ admin/        # Admin-specific components
 ├─ composables/        # Vue composables (use* pattern)
 ├─ layouts/            # Page layouts
 ├─ pages/              # File-based routing (kebab-case)
 ├─ types/              # TypeScript types
 ├─ utils/              # Client utilities
 └─ services/           # Business logic/API services
server/
 ├─ api/                # API routes (HTTP method files)
 ├─ composables/         # Server composables
 ├─ plugins/            # Nuxt server plugins
 └─ utils/              # Server utilities
shared/
 ├─ models/             # Zod schemas & TypeScript types
 └─ schema/             # Drizzle database schema
```

---

## External Guidelines Reference

This project follows the DCC Nuxt.js + TypeScript coding standards from:
https://dcc-bs.github.io/documentation/coding/nuxt

Key standards include:
- Composition API exclusive
- Type enforcement with full coverage
- Biome for code quality
- Tailwind CSS + Lucide icons
- Consistent naming conventions
- Shared code organization
