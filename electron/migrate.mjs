// Applies pending schema migrations directly against the SQLite file on
// app startup, without needing the Prisma CLI (and its schema/engine
// files) bundled into the packaged app. Mirrors what `prisma migrate
// deploy` does: track applied migrations, run only the new ones, in order.
//
// This file gets copied alongside the standalone Next.js server (see
// copy-assets.mjs) and run as a short-lived spawned process using the
// exact same ELECTRON_RUN_AS_NODE + Electron-ABI-rebuilt better-sqlite3
// mechanism as the server itself, rather than requiring a second,
// separately-verified native-module path in Electron's main process.
import Database from "better-sqlite3"
import { readdirSync, readFileSync, existsSync } from "node:fs"
import path from "node:path"

export function runMigrations(dbPath, migrationsDir) {
  const db = new Database(dbPath)
  db.pragma("foreign_keys = ON")
  db.exec(
    `CREATE TABLE IF NOT EXISTS _electron_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  )

  const applied = new Set(
    db.prepare("SELECT name FROM _electron_migrations").all().map((r) => r.name)
  )

  // Migration folder names are timestamp-prefixed, so lexicographic sort
  // is chronological order.
  const migrationFolders = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  let appliedCount = 0
  for (const folder of migrationFolders) {
    if (applied.has(folder)) continue

    const sqlPath = path.join(migrationsDir, folder, "migration.sql")
    if (!existsSync(sqlPath)) continue

    const sql = readFileSync(sqlPath, "utf-8")
    const applyMigration = db.transaction(() => {
      db.exec(sql)
      db.prepare("INSERT INTO _electron_migrations (name) VALUES (?)").run(folder)
    })
    applyMigration()
    appliedCount += 1
    console.log(`[migrate] applied ${folder}`)
  }

  db.close()
  return appliedCount
}

// CLI entry point: `node migrate.mjs <dbPath> <migrationsDir>`
if (process.argv[1] && path.basename(process.argv[1]) === "migrate.mjs") {
  const [, , dbPath, migrationsDir] = process.argv
  if (!dbPath || !migrationsDir) {
    console.error("Usage: node migrate.mjs <dbPath> <migrationsDir>")
    process.exit(1)
  }
  try {
    const count = runMigrations(dbPath, migrationsDir)
    console.log(`[migrate] done, ${count} new migration(s) applied`)
    process.exit(0)
  } catch (err) {
    console.error("[migrate] failed:", err)
    process.exit(1)
  }
}
