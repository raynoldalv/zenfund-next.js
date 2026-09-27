import { sql } from "@vercel/postgres";

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id BIGSERIAL PRIMARY KEY,
      tanggal TIMESTAMPTZ NOT NULL,
      nominal NUMERIC NOT NULL,
      kategori TEXT NOT NULL,
      tipe TEXT NOT NULL CHECK (tipe IN ('income','expense')),
      catatan TEXT,
      foto TEXT
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS budget_config (
      id INT PRIMARY KEY DEFAULT 1,
      nominal NUMERIC NOT NULL DEFAULT 3000000,
      periode TEXT NOT NULL DEFAULT 'bulanan'
    );
  `;
  await sql`
    INSERT INTO budget_config (id, nominal, periode)
    VALUES (1, 3000000, 'bulanan')
    ON CONFLICT (id) DO NOTHING;
  `;
  schemaReady = true;
}

export async function listTransactions() {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM transactions ORDER BY tanggal DESC;`;
  return rows;
}

export async function insertTransaction(tx) {
  await ensureSchema();
  const { rows } = await sql`
    INSERT INTO transactions (tanggal, nominal, kategori, tipe, catatan, foto)
    VALUES (${tx.tanggal}, ${tx.nominal}, ${tx.kategori}, ${tx.tipe}, ${tx.catatan || ""}, ${tx.foto || null})
    RETURNING *;
  `;
  return rows[0];
}

export async function deleteTransaction(id) {
  await ensureSchema();
  await sql`DELETE FROM transactions WHERE id = ${id};`;
}

export async function deleteAllTransactions() {
  await ensureSchema();
  await sql`DELETE FROM transactions;`;
}

export async function getBudget() {
  await ensureSchema();
  const { rows } = await sql`SELECT nominal, periode FROM budget_config WHERE id = 1;`;
  return rows[0];
}

export async function setBudget(nominal, periode) {
  await ensureSchema();
  const { rows } = await sql`
    UPDATE budget_config SET nominal = ${nominal}, periode = ${periode}
    WHERE id = 1 RETURNING nominal, periode;
  `;
  return rows[0];
}
