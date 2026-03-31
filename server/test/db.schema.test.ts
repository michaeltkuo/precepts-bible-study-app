import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { AppDatabase } from "../src/db/db.js";

describe("database schema", () => {
  it("creates all core tables", () => {
    const dbFile = path.join(os.tmpdir(), `precepts-schema-${Date.now()}.db`);
    const appDb = new AppDatabase(dbFile);
    appDb.close();

    const db = new Database(dbFile, { readonly: true });
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as Array<{ name: string }>;

    const tableNames = rows.map((row) => row.name);

    expect(tableNames).toContain("sessions");
    expect(tableNames).toContain("highlights");
    expect(tableNames).toContain("stage_notes");
    expect(tableNames).toContain("cross_refs");
    expect(tableNames).toContain("passages");

    db.close();
    fs.rmSync(dbFile, { force: true });
  });
});
