import { NextResponse } from "next/server";
import { listTransactions, insertTransaction, deleteAllTransactions } from "../../../lib/db";

export async function GET() {
  const rows = await listTransactions();
  return NextResponse.json(rows);
}

export async function POST(request) {
  const body = await request.json();
  if (!body.nominal || body.nominal <= 0) {
    return NextResponse.json({ error: "Nominal tidak valid" }, { status: 400 });
  }
  const tx = await insertTransaction({
    tanggal: body.tanggal || new Date().toISOString(),
    nominal: body.nominal,
    kategori: body.kategori,
    tipe: body.tipe,
    catatan: body.catatan,
    foto: body.foto,
  });
  return NextResponse.json(tx, { status: 201 });
}

export async function DELETE() {
  await deleteAllTransactions();
  return NextResponse.json({ ok: true });
}
