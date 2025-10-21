# Coursebook

A comprehensive course and event booking application with a full CRUD API. This platform allows users to browse and book available courses and events, while providing an admin section for efficient management of all aspects, including users, courses, sessions, and lessons.

The application is composed of a server-side API built with Nuxt and a client-side interface, also built with Nuxt, offering a seamless and integrated user experience.

![GitHub License](https://img.shields.io/github/license/DCC-BS/bs-translator-frontend) [![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

**Test**: [https://kurse.stata.pd.intranet.bs.ch](https://kurse.stata.pd.intranet.bs.ch)
**Prod**: [https://kurse.pdstatasvtapp04.pd.intranet.bs.ch](https://kurse.pdstatasvtapp04.pd.intranet.bs.ch)

## Features

### Server-Side (API)
- **RESTful API**: Built with Nuxt, providing robust CRUD operations for all entities.
- **Database Integration**: Utilizes a SQL database with schema managed by Drizzle ORM.
- **Authentication & Authorization**: Secure user authentication and role-based access control for admin functionalities.
- **Automated Migrations**: Database migrations are automatically run on server startup using the `server/plugins/migrateDb.ts` plugin.
- **Mail Services**: Capable of sending transactional emails (e.g., registration confirmations).

### Client-Side (Application)
The client-side application is the user-facing front-end of the Coursebook platform, built as a Single Page Application (SPA) using Nuxt 3, Vue 3, and TypeScript. It is responsible for presenting data, handling user interactions, managing authentication state, and providing an intuitive interface.

#### Core Technologies:
- **Nuxt 3**: The meta-framework for Vue.js, used for its powerful features like file-based routing, server-side rendering (SSR) capabilities, and a rich module ecosystem.
- **Vue 3**: The progressive JavaScript framework for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
- **TailwindCSS & `@nuxt/ui`**: For styling and UI components, providing a consistent and customizable design system.
- **`motion-v`**: For creating smooth animations and transitions within the application.
- **`@formkit/nuxt`**: For building powerful, accessible, and schema-driven forms.
- **`@nuxtjs/i18n`**: For internationalization, allowing the application to support multiple languages.
- **`@sidebase/nuxt-auth`**: For handling authentication, integrated with Azure AD.

The client-side application communicates with the backend API (also part of the Nuxt project) to fetch and manipulate data, ensuring a seamless full-stack experience.

#### Project Structure (`app/` directory)
The `app/` directory contains all the client-side code, organized to promote modularity and maintainability.

- **`components/`**: Reusable Vue components.
    - **`admin/`**: Components for the admin dashboard (e.g., `AdminCourseForm.vue`, `AdminCourseCard.vue`, `AdminHeader.vue`, `FormEditor.vue` for custom registration forms).
    - **Shared Components**: `DateTime.vue`, `ErrorView.vue`, `LoadingView.vue`, `NavigationMenu.vue`, `SessionView.vue` (handles registration/unregistration).
- **`composables/`**: Vue composables for state management and logic reuse (e.g., `courses.composable.ts`, `me.composable.ts`, `useApiFetch.composable.ts`, `userFeedback.ts`).
- **`layouts/`**: Different page structures.
    - `default.vue`: Standard layout for public pages.
    - `admin.vue`: Admin layout with role-based access control (checks `isAdmin`).
    - `auth.vue`: Layout for authentication pages.
- **`pages/`**: File-based routing.
    - **Public/User-Facing Pages**:
        - `index.vue`: Homepage with course listing, search, and filtering.
        - `courses/[id].vue`: Course detail page with session information.
        - `me.vue`: User profile/dashboard showing registrations and upcoming sessions.
    - **Admin Pages (`/admin/`)**:
        - `index.vue`: Admin dashboard with statistics and quick actions.
        - `users.vue`: User management.
        - `courses/`: Course management (create, edit, list).
- **`types/`**: TypeScript type definitions.
- **`utils/`**: Client-side utility functions (e.g., `dateFormat.utils.ts.ts`).

#### Key Features and Functionality
- **User Interface (UI)**:
    - **Design System**: Built using `@nuxt/ui` components styled with TailwindCSS.
    - **Responsive Design**: Fully responsive for an optimal experience on all devices.
    - **Animations**: Uses `motion-v` for smooth UI animations.
- **Internationalization (i18n)**:
    - **Setup**: Handled by `@nuxtjs/i18n`.
    - **Locales**: Translation files in `i18n/locales/` (e.g., `en.json`, `de.json`). Default is German.
    - **Usage**: `useI18n()` composable for translations.
- **Authentication & Authorization**:
    - **Authentication**: Managed by `@sidebase/nuxt-auth` with Azure AD.
    - **Authorization**: Client-side route protection in `admin.vue` layout.
    - **User State**: `useMe` composable for managing authenticated user's state.
- **Data Fetching & State Management**:
    - **Composables**: Data fetching logic encapsulated in composables (`useCourses`, `useMe`).
    - **State**: Managed via reactive references (`ref`, `computed`) and Nuxt's `useState`.
    - **API Interaction**: `useApiFetch` composable or direct `useFetch`/`$fetch` for API calls.
- **Forms**:
    - **Form Building**: Using `@formkit/nuxt` and `@nuxt/ui`.
    - **Validation**: Zod schemas for form data validation.
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

#### Admin Managing a Course
1.  **Login**: Admin logs in with Azure AD credentials.
2.  **Admin Dashboard**: Admin is redirected to `/admin/index.vue`.
3.  **Course Management**: Admin navigates to `/admin/courses` to list courses.
4.  **Create/Edit Course**:
    - **Create**: Admin goes to `/admin/courses/create`, fills out `AdminCourseForm.vue`, and submits to create via API.
    - **Edit**: Admin clicks "Edit" on a course, pre-fills `AdminCourseForm.vue` on `/admin/courses/[id]/edit`, and submits to update via API.
5.  **Session & Lesson Management**: Admin can manage sessions and lessons for a course through similar form-based interfaces.

## Getting Started

### Default Admin User
On initial setup and after running database migrations, a default admin user is automatically created to facilitate access to the admin panel. The user can be set with the env variable `DEFAULT_ADMIN` (at build time) or `NUXT_DEFAULT_ADMIN` (at runtime) the variable should be set to a valid email which exists in the Entra organization.

### How to change the database schema
1. Make changes to the database schema in `shared/schema`.
2. Run `bun run db:generate` to create a new migration file.
3. The migration file will be created in the `drizzle` folder.

The `server/plugins/migrateDb.ts` plugin will automatically run the migrations on server start.

## Mail

- To test email sending locally: Run `bun docker:dev` and open [http://localhost:1080](http://localhost:1080) to access the mail testing interface.

## Drizzle Studio
- To open Drizzle Studio for database inspection and querying, run `bun run db:studio` and navigate to [https://local.drizzle.studio](https://local.drizzle.studio).

## API Documentation
See [./server/README.md](./server/README.md) for detailed API documentatiod 