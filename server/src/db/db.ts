import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type SessionRow = {
  id: number;
  passage_ref: string;
  bible_id: number;
  title: string;
  passage_text: string;
  created_at: string;
  stage_completed: number;
};

export type PassageRow = {
  id: number;
  bible_id: number;
  usfm: string;
  text: string;
  raw_json: string;
};

export class AppDatabase {
  private db: Database.Database;

  constructor(filePath = path.resolve(process.cwd(), "data", "precepts.db")) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.db = new Database(filePath);
    this.runSchema();
  }

  private runSchema() {
    const schemaPath = path.resolve(process.cwd(), "src", "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    this.db.exec(schemaSql);
  }

  close() {
    this.db.close();
  }

  getCachedPassage(bibleId: number, usfm: string): PassageRow | undefined {
    const stmt = this.db.prepare(
      "SELECT id, bible_id, usfm, text, raw_json FROM passages WHERE bible_id = ? AND usfm = ?"
    );
    return stmt.get(bibleId, usfm) as PassageRow | undefined;
  }

  cachePassage(bibleId: number, usfm: string, text: string, rawJson: string) {
    const stmt = this.db.prepare(
      `INSERT INTO passages (bible_id, usfm, text, raw_json)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(bible_id, usfm) DO UPDATE SET text = excluded.text, raw_json = excluded.raw_json`
    );
    stmt.run(bibleId, usfm, text, rawJson);
  }

  createSession(input: {
    passageRef: string;
    bibleId: number;
    title: string;
    passageText: string;
    stageCompleted?: number;
  }): SessionRow {
    const stmt = this.db.prepare(
      `INSERT INTO sessions (passage_ref, bible_id, title, passage_text, stage_completed)
       VALUES (?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      input.passageRef,
      input.bibleId,
      input.title,
      input.passageText,
      input.stageCompleted ?? 1
    );
    return this.getSessionById(Number(result.lastInsertRowid))!;
  }

  listSessions(): SessionRow[] {
    const stmt = this.db.prepare(
      "SELECT * FROM sessions ORDER BY datetime(created_at) DESC, id DESC"
    );
    return stmt.all() as SessionRow[];
  }

  getSessionById(id: number): SessionRow | undefined {
    const stmt = this.db.prepare("SELECT * FROM sessions WHERE id = ?");
    return stmt.get(id) as SessionRow | undefined;
  }

  updateSession(id: number, input: { title?: string; stageCompleted?: number }): SessionRow | undefined {
    const existing = this.getSessionById(id);
    if (!existing) {
      return undefined;
    }

    const title = input.title ?? existing.title;
    const stage = input.stageCompleted ?? existing.stage_completed;

    const stmt = this.db.prepare(
      "UPDATE sessions SET title = ?, stage_completed = ? WHERE id = ?"
    );
    stmt.run(title, stage, id);

    return this.getSessionById(id);
  }

  deleteSession(id: number): boolean {
    const stmt = this.db.prepare("DELETE FROM sessions WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
