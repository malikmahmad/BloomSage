import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// If TURSO_DATABASE_URL is set, we're in production — use the Turso cloud DB.
// Otherwise fall back to the built-in node:sqlite for local development.
const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
export const isTurso = !!tursoUrl;

// Local SQLite — only initialized when Turso is not configured
let _sqlite = null;

if (!isTurso) {
  const { DatabaseSync } = await import("node:sqlite");
  const dataDir = path.join(__dirname, "..", "..", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  _sqlite = new DatabaseSync(path.join(dataDir, "bloomsage.sqlite"));
  _sqlite.exec("PRAGMA foreign_keys = ON;");
}

// Turso cloud client — only initialized when credentials are present
let _libsql = null;

if (isTurso) {
  const { createClient } = await import("@libsql/client");
  _libsql = createClient({
    url: tursoUrl,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
  });
}

// Returns a prepared-statement-like object with .get(), .all(), and .run()
// that works against either backend. Pass a Turso transaction as `tx` when
// you need multiple statements to run atomically.
function makePrepared(sql, tx = null) {
  if (isTurso) {
    const client = tx ?? _libsql;
    return {
      async get(...args) {
        const result = await client.execute({ sql, args: args.flat() });
        return result.rows[0] ?? null;
      },
      async all(...args) {
        const result = await client.execute({ sql, args: args.flat() });
        return result.rows;
      },
      async run(...args) {
        const result = await client.execute({ sql, args: args.flat() });
        return {
          lastInsertRowid: Number(result.lastInsertRowid ?? 0),
          changes: result.rowsAffected ?? 0,
        };
      },
    };
  }

  // node:sqlite (synchronous)
  return {
    get(...args) {
      const row = _sqlite.prepare(sql).get(...args);
      return row ? Object.assign({}, row) : null;
    },
    all(...args) {
      return _sqlite.prepare(sql).all(...args).map(r => Object.assign({}, r));
    },
    run(...args) {
      return _sqlite.prepare(sql).run(...args);
    },
  };
}

// Unified database interface — same API regardless of backend
export const db = {
  prepare(sql) {
    return makePrepared(sql);
  },

  async transaction(fn) {
    if (isTurso) {
      // Turso interactive transactions give us true atomicity on the cloud DB.
      // We wrap the user's function with a scoped db object so all .prepare()
      // calls inside automatically go through the open transaction.
      const tx = await _libsql.transaction("write");
      const txDb = {
        prepare: (sql) => makePrepared(sql, tx),
        // Nested transactions aren't supported — just run the function inline
        transaction: (innerFn) => innerFn(),
      };
      try {
        const result = await fn(txDb);
        await tx.commit();
        return result;
      } catch (err) {
        try { await tx.rollback(); } catch { /* already rolled back */ }
        throw err;
      }
    }

    // Local SQLite — use BEGIN/COMMIT
    _sqlite.exec("BEGIN");
    try {
      const result = await fn(db);
      _sqlite.exec("COMMIT");
      return result;
    } catch (err) {
      try { _sqlite.exec("ROLLBACK"); } catch { /* already rolled back */ }
      throw err;
    }
  },
};

// Applies schema.sql idempotently on startup — safe to run every time
// because every statement uses CREATE TABLE IF NOT EXISTS
export async function runMigrations() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  if (isTurso) {
    const statements = schema.split(";").map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await _libsql.execute(stmt);
    }
  } else {
    _sqlite.exec(schema);
  }
}
