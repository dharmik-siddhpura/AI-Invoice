import { prisma } from "@/lib/prisma";
import { isValidEmail, sanitizeString } from "@/lib/validate";
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

export async function GET() {
  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = sanitizeString(body.name, 200);
    const email = sanitizeString(body.email, 200);

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

    const business = await getOrCreateBusiness();
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: sanitizeString(body.phone, 30),
        address: sanitizeString(body.address, 300),
        city: sanitizeString(body.city, 100),
        country: sanitizeString(body.country, 100),
        businessId: business.id,
      },
    });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
