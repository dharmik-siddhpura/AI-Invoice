import { prisma } from "@/lib/prisma";
import { isValidStatus, sanitizeString } from "@/lib/validate";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: sanitizeString(id, 50) },
      include: { client: true, items: true, business: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status = sanitizeString(body.status ?? "", 20);

    if (!status || !isValidStatus(status))
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });

    const exists = await prisma.invoice.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const invoice = await prisma.invoice.update({ where: { id }, data: { status } });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const exists = await prisma.invoice.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
