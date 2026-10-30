"use client";
import { useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";

export default function PricingPage() {
  const me = useMe();

  async function checkout(plan: "monthly" | "annual") {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <>
      <h1>Pricing</h1>
      <div className="grid" style={{ maxWidth: 720 }}>
        <div className="card stack">
          <strong>Free</strong>
          <p className="muted">Unlimited manual recipes and 3-day meal plans.</p>
          <span className="pill">Current</span>
        </div>
        <div className="card stack">
          <strong>Paid</strong>
          <p className="muted">URL import and full 7-day planner.</p>
          <div className="row">
            <button onClick={() => checkout("monthly")}>Monthly</button>
            <button className="ghost" onClick={() => checkout("annual")}>Annual</button>
          </div>
        </div>
      </div>
    </>
  );
}
