# Courseboocker

![GitHub License](https://img.shields.io/github/license/DCC-BS/bs-translator-frontend) [![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

**Test**: [https://kurse.stata.pd.intranet.bs.ch](https://kurse.stata.pd.intranet.bs.ch)
**Prod**: [https://kurse.pdstatasvtapp04.pd.intranet.bs.ch](https://kurse.pdstatasvtapp04.pd.intranet.bs.ch)

## How to change the database schema
1. Make changes to the database schema in `shared/schema`.
2. Run `bun run db:generate` to create a new migration file.
3. The migration file will be created in the `drizzle` folder.

The `server/plugins/migrateDb.ts` plugins will automatically run the migrations on server start.


## Mail

- to test email sending locally: `bun docker:dev` and open http://localhost:1080


