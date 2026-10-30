"use client";
import { useEffect, useState } from "react";

const KEY = "zombie-cook-me";

export function setMe(id: string) {
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event("me-changed"));
}

export function useMe(): string | null {
  const [me, setMeState] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setMeState(localStorage.getItem(KEY));
    read();
    window.addEventListener("me-changed", read);
    return () => window.removeEventListener("me-changed", read);
  }, []);
  return me;
}
