"use client";
import { useEffect, useState } from "react";
import { setMe, useMe } from "@/lib/useMe";

type Option = { id: string; name: string };

export default function PretendPicker() {
  const me = useMe();
  const [people, setPeople] = useState<Option[]>([]);

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((list: Option[]) => {
      setPeople(list);
      if (!localStorage.getItem("zombie-cook-me") && list[0]) setMe(list[0].id);
    });
  }, []);

  return (
    <label style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: 8 }}>
      Pretend to be
      <select value={me ?? ""} onChange={(e) => setMe(e.target.value)} style={{ width: "auto" }}>
        {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </label>
  );
}
