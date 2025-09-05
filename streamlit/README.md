# CourseBooker

## How to change the database schema
1. Make changes to the database schema in `shared/schema`.
2. Run `bun run db:generate` to create a new migration file.
3. The migration file will be created in the `drizzle` folder.

The `server/plugins/migrateDb.ts` plugins will automatically run the migrations on server start.