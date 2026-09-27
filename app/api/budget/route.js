import { NextResponse } from "next/server";
import { getBudget, setBudget } from "../../../lib/db";

export async function GET() {
  const budget = await getBudget();
  return NextResponse.json(budget);
}

export async function POST(request) {
  const { nominal, periode } = await request.json();
  if (!nominal || nominal <= 0) {
    return NextResponse.json({ error: "Nominal tidak valid" }, { status: 400 });
  }
  const budget = await setBudget(nominal, periode);
  return NextResponse.json(budget);
}
