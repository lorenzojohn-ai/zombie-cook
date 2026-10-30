import { NextResponse } from "next/server";
import Stripe from "stripe";

const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || "";
const PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL || "";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe secret key not configured.");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

export async function POST(req: Request) {
  const { plan } = await req.json().catch(() => ({ plan: "monthly" }));
  const priceId = plan === "annual" ? PRICE_ANNUAL : PRICE_MONTHLY;
  if (!priceId) {
    return NextResponse.json({ error: "Pricing not configured." }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3109"}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3109"}/pricing?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Checkout failed." }, { status: 500 });
  }
}
