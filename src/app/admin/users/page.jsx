import Link from "next/link";
import ConfirmButton from "@/components/ConfirmButton";
import Notice from "@/components/Notice";
import { SellerBadge } from "@/components/Badge";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteUser } from "@/actions/admin";

export const metadata = { title: "Manajemen User" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q ?? "").trim();
  const currentAdmin = await getCurrentUser();

  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.seller_status, u.is_active, u.created_at, s.name AS store_name
     FROM users u
     LEFT JOIN stores s ON s.user_id = u.id
     WHERE u.name ILIKE $1 OR u.email ILIKE $1
     ORDER BY u.created_at DESC
     LIMIT 100`,
    [`%${q}%`]
  );

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Manajemen User</h2>
      <Notice ok={sp?.ok} err={sp?.err} />
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau email..."
          className="input max-w-xs"
        />
        <button className="btn btn-outline">Cari</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs text-muted">
            <tr>
              <th className="p-3">Pengguna</th>
              <th className="p-3">Telepon</th>
              <th className="p-3">Role</th>
              <th className="p-3">Toko</th>
              <th className="p-3">Terdaftar</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </td>
                  <td className="p-3 text-muted">{u.phone ?? "-"}</td>
                  <td className="p-3">
                    <span className="inline-block rounded-full bg-line px-2 py-0.5 text-xs font-medium capitalize">
                      {u.role}
                    </span>
                    {u.role === "seller" && u.seller_status && (
                      <span className="ml-1.5 inline-block">
                        <SellerBadge status={u.seller_status} />
                      </span>
                    )}
                    {u.is_active === false && (
                      <span className="ml-1.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted">{u.store_name ?? "-"}</td>
                  <td className="p-3 text-xs text-muted">{formatDate(u.created_at)}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/users/${u.id}/edit`}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </Link>
                      {u.id !== currentAdmin?.id && u.is_active !== false && (
                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <ConfirmButton message={`Nonaktifkan akun "${u.name}"?`}>
                            Nonaktifkan
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}