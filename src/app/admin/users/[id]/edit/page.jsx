import { notFound } from "next/navigation";
import UserEditForm from "@/components/UserEditForm";
import { query } from "@/lib/db";

export const metadata = { title: "Edit User" };
export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }) {
  const { id } = await params;
  if (!Number.isInteger(Number(id))) notFound();
  const { rows } = await query("SELECT id, name, email, phone, role FROM users WHERE id = $1", [Number(id)]);
  if (!rows[0]) notFound();
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Edit User</h2>
      <UserEditForm user={rows[0]} />
    </div>
  );
}
