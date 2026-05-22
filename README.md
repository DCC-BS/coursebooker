# Coursebook

A comprehensive course and event booking application with a full CRUD API. This platform allows users to browse and book available courses and events, while providing an admin section for efficient management of all aspects, including users, courses, sessions, and lessons.

The application is composed of a server-side API built with Nuxt and a client-side interface, also built with Nuxt, offering a seamless and integrated user experience.

![GitHub License](https://img.shields.io/github/license/DCC-BS/coursebook) [![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Features

### Server-Side (API)
- **RESTful API**: Built with Nuxt, providing robust CRUD operations for all entities.
- **Database Integration**: Utilizes a SQLite database with schema managed by Drizzle ORM.
- **Authentication & Authorization**: Secure user authentication via the `nuxt-layers/auth` layer (supports Azure AD and no-auth modes) and role-based access control for admin functionalities.
- **Automated Migrations**: Database migrations are automatically run on server startup using the `server/plugins/migrateDb.ts` plugin.
- **Email Services**: Transactional emails (registration confirmations, cancellations, custom notifications) rendered via Handlebars templates in `server/templates/`.
- **ICS Calendar Support**: Generates and versions iCalendar files for session bookings.
- **OpenAPI Documentation**: Auto-generated API docs available at `/_openapi.json`, `/_scalar`, and `/_swagger` (ReDoc).

### Client-Side (Application)
The client-side application is the user-facing front-end of the Coursebook platform, built as a Single Page Application (SPA) using Nuxt 4, Vue 3, and TypeScript. It is responsible for presenting data, handling user interactions, managing authentication state, and providing an intuitive interface.

#### Core Technologies:
- **Nuxt 4**: The meta-framework for Vue.js, used for its powerful features like file-based routing, server-side rendering (SSR) capabilities, and a rich module ecosystem.
- **Vue 3**: The progressive JavaScript framework for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
- **TailwindCSS & `@nuxt/ui` v4**: For styling and UI components, providing a consistent and customizable design system.
- **`motion-v`**: For creating smooth animations and transitions within the application.
- **`@formkit/nuxt`**: For building powerful, accessible, and schema-driven forms.
- **`@nuxtjs/i18n`**: For internationalization, allowing the application to support multiple languages.
- **`@nuxtjs/mdc`**: For rendering Markdown content components.
- **`@dcc-bs/*` libraries**: Shared packages for common UI components (`@dcc-bs/common-ui.bs.js`) and dependency injection (`@dcc-bs/dependency-injection.bs.js`).
- **DCC-BS Nuxt Layers**: Remote layers providing authentication (`DCC-BS/nuxt-layers/auth`) and logging (`DCC-BS/nuxt-layers/logger`).

The client-side application communicates with the backend API (also part of the Nuxt project) to fetch and manipulate data, ensuring a seamless full-stack experience.

#### Project Structure (`app/` directory)
The `app/` directory contains all the client-side code, organized to promote modularity and maintainability.

- **`components/`**: Reusable Vue components.
    - **`admin/`**: Components for the admin dashboard:
        - `AdminCourseCard.vue`, `AdminCourseForm.vue` — Course management.
        - `AdminSessionCard.vue`, `AdminSessionForm.vue` — Session management.
        - `AdminLessonCard.vue`, `AdminLessonForm.vue` — Lesson management.
        - `AdminUserCard.vue`, `AdminUserForm.vue` — User management.
        - `AdminRegistrationsCard.vue` — Registration overview.
        - `AdminHeader.vue` — Admin navigation header.
        - `FormEditor.vue` — Custom registration form editor.
        - `NotifyConfirmModal.vue` — Confirmation modal for session notifications.
    - **Shared Components**: `DateTime.vue`, `ErrorView.vue`, `LoadingView.vue`, `NavigationMenu.vue`, `SessionView.vue` (handles registration/unregistration).
- **`composables/`**: Vue composables for state management and logic reuse (`courses.composable.ts`, `sessions.composable.ts`, `me.composable.ts`, `users.composable.ts`, `useApiFetch.composable.ts`).
- **`layouts/`**: Different page structures.
    - `default.vue`: Standard layout for public pages.
    - `admin.vue`: Admin layout with role-based access control (checks `isAdmin` via `fetchMe()`).
    - `auth.vue`: Pass-through layout wrapper (slot only) for authentication pages provided by the `nuxt-layers/auth` layer.
- **`pages/`**: File-based routing.
    - **Public/User-Facing Pages**:
        - `index.vue`: Homepage with course listing, search, and filtering.
        - `courses/[id].vue`: Course detail page with session information.
        - `courses/[courseId]/[sessionId].vue`: Session detail page.
        - `me.vue`: User profile/dashboard showing registrations and upcoming sessions.
    - **Auth Pages** (provided by `nuxt-layers/auth` layer, not in `app/pages/`):
        - Sign-in page is handled by the remote auth layer.
    - **Admin Pages (`/admin/`)**:
        - `index.vue`: Admin dashboard with statistics and quick actions.
        - `users.vue`: User management.
        - `courses/`: Course management (create, edit, list).
        - `courses/[id]/sessions/`: Session management for a course.
        - `courses/[id]/sessions/[sessionId]/notify.vue`: Send notifications to registered users.
- **`types/`**: TypeScript type definitions.
- **`utils/`**: Client-side utility functions (e.g., `course.utils.ts`, `dateFormat.utils.ts.ts`).

#### Key Features and Functionality
- **User Interface (UI)**:
    - **Design System**: Built using `@nuxt/ui` v4 components styled with TailwindCSS.
    - **Responsive Design**: Fully responsive for an optimal experience on all devices.
    - **Animations**: Uses `motion-v` for smooth UI animations.
- **Internationalization (i18n)**:
    - **Setup**: Handled by `@nuxtjs/i18n`.
    - **Locales**: Translation files in `i18n/locales/` (`en.json`, `de.json`). Default is German.
    - **Usage**: `useI18n()` composable for translations.
- **Authentication & Authorization**:
    - **Authorization**: Client-side route protection in `admin.vue` layout.
    - **User State**: `useMe` composable for managing authenticated user's state.
- **Data Fetching & State Management**:
    - **Composables**: Data fetching logic encapsulated in composables (`useCourses`, `useCourse`, `useSession`, `useSetSession`, `useMe`, `useUsers`).
    - **State**: Managed via reactive references (`ref`, `computed`) and Nuxt's `useState`.
    - **API Interaction**: `useSchemaFetch`/`fetchWithSchema` composables (from `useApiFetch.composable.ts`) for schema-validated API calls, or direct `useFetch`/`$fetch` for unvalidated calls.
- **Forms**:
    - **Form Building**: Using `@formkit/nuxt` and `@nuxt/ui`.
    - **Validation**: Zod schemas for form data validation.
    - **Input Masking**: `maska` for formatted input fields.
    - **Dynamic Forms**: `FormEditor.vue` allows admins to create custom JSON schema-based registration forms.
- **Navigation**:
    - **Component**: `NavigationMenu.vue` for primary links.
    - **Routing**: Nuxt's file-based routing. Programmatic navigation with `useRouter()` and `navigateTo()`.

### User Workflows

#### Browsing and Booking a Course
1.  **Discovery**: User lands on `index.vue`, views and filters/searches courses.
2.  **Course Details**: User clicks a course to view `courses/[id].vue`, seeing full details and sessions.
3.  **Session Selection**: User reviews sessions on the course page.
4.  **Registration**: User clicks "Register" in `SessionView.vue`.
    - If a custom form exists, it's rendered in a drawer for completion.
    - Otherwise, registration is immediate.
5.  **Confirmation**: API call registers the user. Success message is shown, and UI updates.
6.  **Calendar**: User can download an ICS file for the booked session.

#### Admin Managing a Course
1.  **Login**: Admin logs in with Azure AD credentials.
2.  **Admin Dashboard**: Admin is redirected to `/admin`.
3.  **Course Management**: Admin navigates to `/admin/courses` to list courses.
4.  **Create/Edit Course**:
    - **Create**: Admin goes to `/admin/courses/create`, fills out `AdminCourseForm.vue`, and submits to create via API.
    - **Edit**: Admin clicks "Edit" on a course, pre-fills `AdminCourseForm.vue` on `/admin/courses/[id]/edit`, and submits to update via API.
5.  **Session & Lesson Management**: Admin manages sessions and lessons for a course through form-based interfaces under `/admin/courses/[id]/sessions/`.
6.  **Notifications**: Admin can send custom notifications to registered users from `/admin/courses/[id]/sessions/[sessionId]/notify`.

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js
- A running SQLite database (or use the default local file-based DB)

### Installation
```bash
bun install
```

### Environment Setup
Copy the `.env.schema` file to `.env` and fill in the required values. The project uses [Varlock](https://varlock.dev) with the ProtonPass plugin for secret management.

| Variable | Required | Description |
|---|---|---|
| `APP_MODE` | Yes | Application mode: `dev`, `build`, `ci`, or `prod` |
| `AUTH_MODE` | Yes | Authentication mode: `none` (no auth) or `azure` (Azure AD) |
| `DATABASE_URL` | Yes | SQLite database path (e.g., `data/coursebooker.db`) |
| `NUXT_AZURE_AUTH_SECRET` | Yes* | Secret key for Azure AD session encryption (required when `AUTH_MODE=azure`) |
| `NUXT_AZURE_AUTH_CLIENT_ID` | Yes* | Azure AD client ID (required when `AUTH_MODE=azure`) |
| `NUXT_AZURE_AUTH_TENANT_ID` | Yes* | Azure AD tenant ID (required when `AUTH_MODE=azure`) |
| `NUXT_AZURE_AUTH_CLIENT_SECRET` | Yes* | Azure AD client secret (required when `AUTH_MODE=azure`) |
| `NUXT_AZURE_AUTH_ORIGIN` | No* | Auth origin URL for Azure AD (required when `AUTH_MODE=azure`) |
| `SMTP_HOST` | No | SMTP server host (default: `localhost`) |
| `SMTP_PORT` | No | SMTP server port (default: `1030`) |
| `MAIL_FROM` | No | Sender email address for outgoing mails (default: `noreply@example.com`) |
| `DEFAULT_ADMIN` | No | Default admin user email |
| `NUXT_SITE_URL` | No | Site URL (default: `http://localhost:3000`) |
| `LOG_LEVEL` | No | Log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |

\* Required only when `AUTH_MODE=azure`.

### Development
```bash
bun run dev
```

### Default Admin User
On initial setup and after running database migrations, a default admin user is automatically created to facilitate access to the admin panel. Set the `DEFAULT_ADMIN` environment variable to a valid email that exists in the Entra organization.

### How to Change the Database Schema
1. Make changes to the database schema in `shared/schema/`.
2. Run `bun run db:generate` to create a new migration file.
3. The migration file will be created in the `drizzle/` folder.

The `server/plugins/migrateDb.ts` plugin will automatically run the migrations on server start.

### Docker Deployment

**Production:**
```bash
docker compose up -d
```
The app is exposed on port `8502` (mapped to internal port `3000`). Data is persisted in the `./data` volume.

**Development (mail testing):**
```bash
bun run docker:dev
```

## Mail

- To test email sending locally: Run `bun run docker:dev` and open [http://localhost:1080](http://localhost:1080) to access the mail testing interface.

## Mail Templates

All mail templates live in `server/templates/` and use [Handlebars](https://handlebarsjs.com/) syntax. Each template exports an `html` and a `text` variant (for rich and plain-text email clients respectively).

### Template Files

| File | Purpose |
|---|---|
| `server/templates/registration.ts` | Sent when a user registers for a session |
| `server/templates/unregister.ts` | Sent when a user unregisters from a session |
| `server/templates/cancellation.ts` | Sent when a session is cancelled by an admin |
| `server/templates/custom-notification.ts` | Sent when an admin sends a custom message to registered users |
| `server/templates/partials/course-details.ts` | Shared partials: course details block and signature (used by all templates) |

### Editing an Existing Template

1. Open the template file in `server/templates/` (e.g., `registration.ts`).
2. Edit the exported `xxxHtml` string for the HTML variant and the `xxxText` string for the plain-text variant. Both must always be kept in sync.
3. You can use any Handlebars syntax (`{{variable}}`, `{{#if condition}}...{{/if}}`, `{{> partialName}}`).
4. Restart the dev server to pick up changes: `bun run dev`.

### Available Template Variables

All templates receive a context built by `buildCourseContext()` (defined in `server/utils/mail.utils.ts`). The following variables are available in every template:

| Variable | Type | Description |
|---|---|---|
| `givenName` | string | Recipient's first name |
| `familyName` | string | Recipient's last name |
| `courseTitle` | string | Title of the course/event |
| `courseTypeLabel` | string | Localized label: "Kurs" or "Event" |
| `dateStr` | string | Formatted date(s) of lessons (e.g., `01.06.2026` or numbered list) |
| `timeStr` | string or null | Formatted time range for single-lesson sessions (e.g., `09:00 - 17:00`) |
| `isSingleLesson` | boolean | Whether the session has only one lesson |
| `location` | string | Session location (defaults to "Nicht bekannt") |
| `teamsLink` | string or null | MS Teams link if set |
| `siteUrl` | string | Base URL of the application |
| `courseId` | string | Course ID (for building links) |
| `sessionId` | string | Session ID (for building links) |
| `organizerName` | string | Name of the course organizer |
| `organizerMail` | string | Email of the course organizer |

Some templates receive additional variables:

| Variable | Template(s) | Type | Description |
|---|---|---|---|
| `hasIcsAttachment` | registration, custom-notification | boolean | Whether an ICS calendar file is attached |
| `customMessage` | custom-notification | string | Admin-written custom message |

### Adding a New Template

1. Create a new file in `server/templates/` (e.g., `server/templates/my-template.ts`).
2. Export two strings: `myTemplateHtml` and `myTemplateText` using Handlebars syntax. Reuse the shared partials:
   ```typescript
   import { courseDetailsHtml, courseDetailsText, signatureHtml, signatureText } from "./partials/course-details";
   export { courseDetailsHtml, courseDetailsText, signatureHtml, signatureText };
   export const myTemplateHtml = `...{{> courseDetailsHtml}}...{{> signatureHtml}}...`;
   export const myTemplateText = `...{{> courseDetailsText}}...{{> signatureText}}...`;
   ```
3. Register the template in `server/utils/template.utils.ts`:
   - Add the new template name to the `TemplateName` union type.
   - Import and add the HTML/text sources to the `templateSources` record.
4. Call `renderTemplate("my-template", context)` from `server/utils/mail.utils.ts` in a new or existing send function.
5. If the template uses new context variables, extend the `extras` parameter in `buildCourseContext()`.

### Testing Mail Template Changes

1. Start the mail dev container: `bun run docker:dev`
2. Start the dev server: `bun run dev`
3. Trigger the email you want to test (e.g., register for a session via the UI or API).
4. Open [http://localhost:1080](http://localhost:1080) to view the sent emails (HTML and plain text) in the MailDev interface.

## Drizzle Studio

- To open Drizzle Studio for database inspection and querying, run `bun run db:studio` and navigate to [https://local.drizzle.studio](https://local.drizzle.studio).

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Format code with Biome |
| `bun run check` | Lint and format with Biome |
| `bun run db:generate` | Generate a new migration |
| `bun run db:push` | Push schema changes directly to DB |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:migrate` | Run migrations manually |
| `bun run env:check` | Validate environment variables |
| `bun run docker:dev` | Start mail dev container |
| `bun run docker:dev:down` | Stop mail dev container |

## API Documentation

See [./server/README.md](./server/README.md) for detailed API documentation. Interactive API docs are also available at `/_scalar` and `/_swagger` when the server is running.
