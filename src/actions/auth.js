"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { destroySession, getCurrentUser } from "@/lib/auth";

// Login & register ada di route handler: src/app/api/login & api/register

export async function logout() {
  await destroySession();
  redirect("/");
}

// Seller yang ditolak boleh menghapus akunnya sendiri
export async function deleteRejectedAccount() {
  const user = await getCurrentUser();
  if (user && user.role === "seller" && user.seller_status === "rejected") {
    await query("DELETE FROM users WHERE id = $1", [user.id]);
    await destroySession();
  }
  redirect("/");
}
