import { NextResponse } from "next/server";
import Stripe from "stripe";
import { setProfilePaid } from "@/lib/db";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe secret key not configured.");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    setProfilePaid(customerId, true);
  }

  return NextResponse.json({ received: true });
}
