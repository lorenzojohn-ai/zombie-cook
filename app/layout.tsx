import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Sponsors from "@/components/Sponsors";
import PretendPicker from "@/components/PretendPicker";

export const metadata: Metadata = {
  title: "Zombie Cook",
  description: "A recipe box, meal planner and grocery list.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="zombie-bar">
          🧟 Zombie Cook: revived and hungry.
        </div>
        <nav className="nav">
          <Link href="/" className="brand">Zombie Cook</Link>
          <Link href="/">Recipes</Link>
          <Link href="/recipes/new">Add recipe</Link>
          <Link href="/plan">Meal plan</Link>
          <Link href="/grocery">Grocery list</Link>
          <Link href="/pricing">Pricing</Link>
          <PretendPicker />
        </nav>
        <main>{children}</main>
        <Sponsors />
      </body>
    </html>
  );
}
