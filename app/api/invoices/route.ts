import { prisma } from "@/lib/prisma";
import { isValidDate, isValidStatus, sanitizeNumber, sanitizeString } from "@/lib/validate";
import { NextRequest, NextResponse } from "next/server";

async function getOrCreateBusiness() {
  let business = await prisma.business.findFirst();
  if (!business) {
    business = await prisma.business.create({
      data: { name: "My Business", email: "", currency: "USD" },
    });
  }
  return business;
}

function generateInvoiceNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `INV-${ts}-${rand}`;
}

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, items: true },
    });
    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const clientId = sanitizeString(body.clientId, 100);
    const dueDate = sanitizeString(body.dueDate, 30);
    const status = sanitizeString(body.status, 20);
    const notes = sanitizeString(body.notes, 1000);

    if (!clientId) return NextResponse.json({ error: "Client is required" }, { status: 400 });
    if (!dueDate || !isValidDate(dueDate))
      return NextResponse.json({ error: "Valid due date is required" }, { status: 400 });
    if (status && !isValidStatus(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
    if (!clientExists) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    if (!Array.isArray(body.items) || body.items.length === 0)
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });

    const items = (body.items as unknown[]).map((item) => {
      const i = item as Record<string, unknown>;
      return {
        description: sanitizeString(i.description, 500),
        quantity: sanitizeNumber(i.quantity),
        rate: sanitizeNumber(i.rate),
      };
    });

    const invalidItem = items.find((i) => !i.description || i.quantity <= 0 || i.rate < 0);
    if (invalidItem)
      return NextResponse.json(
        { error: "Each item needs a description, valid quantity, and non-negative rate" },
        { status: 400 }
      );

    const business = await getOrCreateBusiness();
    const number = generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        number,
        status: isValidStatus(status) ? status : "DRAFT",
        dueDate: new Date(dueDate),
        notes,
        clientId,
        businessId: business.id,
        items: { create: items },
      },
      include: { client: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
