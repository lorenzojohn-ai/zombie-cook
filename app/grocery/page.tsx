"use client";
import { useCallback, useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";
import { showAmount, convertUnit, isStandardUnit } from "@/lib/scale";
import type { GroceryItem } from "@/lib/grocery";

export default function GroceryPage() {
  const me = useMe();
  const [items, setItems] = useState<GroceryItem[] | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!me) return;
    setItems(await (await fetch(`/api/grocery?owner=${me}`)).json());
  }, [me]);

  useEffect(() => { load(); }, [load]);

  async function toggle(key: string) {
    await fetch("/api/grocery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, userId: me }),
    });
    load();
  }

  async function email() {
    const res = await fetch("/api/grocery/email", { method: "POST" });
    setMsg((await res.json()).error ?? "Sent.");
  }

  const left = items?.filter((i) => !i.checked).length ?? 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Grocery list</h1>
          <p className="sub">Built from your meal plan. {items ? `${left} left to buy.` : ""}</p>
        </div>
        <button className="ghost" onClick={email}>Email me this list</button>
      </div>
      {msg && <p className="error">{msg}</p>}
      {items?.length === 0 && (
        <div className="card empty">
          <strong>Nothing to buy yet.</strong>
          <span className="muted">Put some recipes in the meal plan first.</span>
        </div>
      )}
      <div className="list">
        {items?.map((i) => {
          const converted = isStandardUnit(i.unit) ? convertUnit(i.amount, i.unit) : { amount: i.amount, unit: i.unit };
          return (
            <label key={i.key} className={`card row nowrap check-row${i.checked ? " done" : ""}`} style={{ cursor: "pointer", color: "inherit", fontSize: 16 }}>
              <input type="checkbox" checked={i.checked} onChange={() => toggle(i.key)} style={{ width: 20 }} />
              <span><strong>{showAmount(converted.amount)}</strong> {converted.unit} {i.name}</span>
            </label>
          );
        })}
      </div>
    </>
  );
}
