import { prisma } from "@/lib/prisma";
import { isValidCurrency, isValidEmail, sanitizeString } from "@/lib/validate";
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
    const business = await getOrCreateBusiness();
    return NextResponse.json(business);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const business = await getOrCreateBusiness();

    const email = sanitizeString(body.email, 200);
    const currency = sanitizeString(body.currency, 10);

    if (email && !isValidEmail(email))
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (currency && !isValidCurrency(currency))
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        name: sanitizeString(body.name, 200) || business.name,
        email: email || business.email,
        phone: sanitizeString(body.phone, 30),
        address: sanitizeString(body.address, 300),
        city: sanitizeString(body.city, 100),
        country: sanitizeString(body.country, 100),
        currency: isValidCurrency(currency) ? currency : business.currency,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
