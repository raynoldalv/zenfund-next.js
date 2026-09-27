import { NextResponse } from "next/server";
import { deleteTransaction } from "../../../../lib/db";

export async function DELETE(request, { params }) {
  const { id } = await params;
  await deleteTransaction(id);
  return NextResponse.json({ ok: true });
}