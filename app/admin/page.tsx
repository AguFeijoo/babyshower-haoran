import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getStore, usingMemory } from "@/lib/db";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel de los papás", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;
  const store = getStore();
  const [gifts, pledges, seenAt] = await Promise.all([store.listGifts(), store.listPledges(), store.getSeenAt()]);
  return <Dashboard gifts={gifts} pledges={pledges} seenAt={seenAt} memoryMode={usingMemory()} />;
}
