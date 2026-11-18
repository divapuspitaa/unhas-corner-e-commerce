import { redirect } from "next/navigation";
import { getCurrentUser, homePathFor } from "@/lib/auth";

// Pintu masuk dashboard: arahkan sesuai role. Guest -> login.
export default async function DashboardRouter() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(homePathFor(user));
}
