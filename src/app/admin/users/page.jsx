import Link from "next/link";
import { LuUserCheck, LuUserX, LuClock, LuSearch } from "react-icons/lu";
import ConfirmButton from "@/components/ConfirmButton";
import { SellerBadge } from "@/components/Badge";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteUser, reactivateUser, rejectReactivation } from "@/actions/admin";

export const metadata = { title: "Manajemen User" };
export const dynamic = "force-dynamic";

const TABS = [
  ["semua", "Semua User"],
  ["aktif", "Aktif"],
  ["nonaktif", "Nonaktif"],
  ["pengajuan", "Pengajuan Aktif Kembali"],
];

export default async function AdminUsersPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q ?? "").trim();
  const statusFilter = sp?.status ?? "semua";
  const currentAdmin = await getCurrentUser();

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reactivation_requested_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reactivation_reason TEXT
  `);

  const [{ rows }, { rows: counts }] = await Promise.all([
    query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.seller_status, u.is_active,
              u.reactivation_requested_at, u.reactivation_reason, u.created_at, s.name AS store_name
       FROM users u
       LEFT JOIN stores s ON s.user_id = u.id
       WHERE (u.name ILIKE $1 OR u.email ILIKE $1)
         AND (
           $2 = 'semua'
           OR ($2 = 'aktif' AND u.is_active IS NOT FALSE)
           OR ($2 = 'nonaktif' AND u.is_active = FALSE)
           OR ($2 = 'pengajuan' AND u.is_active = FALSE AND u.reactivation_requested_at IS NOT NULL)
         )
       ORDER BY
         (u.is_active = FALSE AND u.reactivation_requested_at IS NOT NULL) DESC,
         u.created_at DESC
       LIMIT 100`,
      [`%${q}%`, statusFilter]
    ),
    query(`
      SELECT
        COUNT(*)::int AS all_count,
        COUNT(*) FILTER (WHERE is_active IS NOT FALSE)::int AS active_count,
        COUNT(*) FILTER (WHERE is_active = FALSE)::int AS inactive_count,
        COUNT(*) FILTER (WHERE is_active = FALSE AND reactivation_requested_at IS NOT NULL)::int AS request_count
      FROM users
    `),
  ]);

  const c = counts[0];
  const badgeMap = {
    semua: c.all_count,
    aktif: c.active_count,
    nonaktif: c.inactive_count,
    pengajuan: c.request_count,
  };

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(([key, label]) => {
            const active = statusFilter === key;
            const href = new URLSearchParams();
            if (key !== "semua") href.set("status", key);
            if (q) href.set("q", q);
            const url = href.toString() ? `/admin/users?${href.toString()}` : "/admin/users";

            return (
              <Link
                key={key}
                href={url}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-white shadow-xs"
                    : "border border-line bg-white text-ink hover:border-primary hover:bg-primary-soft hover:text-primary"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-surface text-muted"
                  }`}
                >
                  {badgeMap[key]}
                </span>
              </Link>
            );
          })}
        </div>

        <form className="flex gap-2">
          {statusFilter !== "semua" && <input type="hidden" name="status" value={statusFilter} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau email..."
            className="input w-56 sm:w-64"
          />
          <button className="btn btn-outline">
            <LuSearch size={15} /> Cari
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs text-muted">
            <tr>
              <th className="p-3.5">Pengguna</th>
              <th className="p-3.5">Role & Status</th>
              <th className="p-3.5">Toko</th>
              <th className="p-3.5">Terdaftar</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  Tidak ada pengguna yang sesuai dengan filter ini.
                </td>
              </tr>
            ) : (
              rows.map((u) => {
                const hasReactivationReq = u.is_active === false && Boolean(u.reactivation_requested_at);

                return (
                  <tr
                    key={u.id}
                    className={`border-b border-line last:border-0 ${
                      hasReactivationReq ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="p-3.5">
                      <p className="font-semibold text-ink">{u.name}</p>
                      <p className="text-xs text-muted">
                        {u.email} {u.phone ? `· ${u.phone}` : ""}
                      </p>

                      {hasReactivationReq && (
                        <div className="mt-2 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                          <p className="flex items-center gap-1 font-semibold">
                            <LuClock size={12} className="text-amber-600" />
                            Alasan Pengajuan Aktif Kembali:
                          </p>
                          <p className="mt-0.5 text-amber-800">{u.reactivation_reason}</p>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block rounded-full bg-line px-2.5 py-0.5 text-xs font-medium capitalize">
                          {u.role}
                        </span>
                        {u.role === "seller" && u.seller_status && (
                          <SellerBadge status={u.seller_status} />
                        )}
                        {u.is_active === false ? (
                          <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            Nonaktif
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            Aktif
                          </span>
                        )}
                        {hasReactivationReq && (
                          <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            Minta Aktif Kembali
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-muted">{u.store_name ?? "-"}</td>
                    <td className="p-3.5 text-xs text-muted">{formatDate(u.created_at)}</td>

                    <td className="p-3.5 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${u.id}/edit`}
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </Link>

                        {u.is_active === false ? (
                          <>
                            <form action={reactivateUser}>
                              <input type="hidden" name="userId" value={u.id} />
                              <ConfirmButton
                                className="btn btn-primary btn-sm"
                                message={`Aktifkan kembali akun "${u.name}"?`}
                              >
                                <LuUserCheck size={14} /> Aktifkan
                              </ConfirmButton>
                            </form>

                            {hasReactivationReq && (
                              <form action={rejectReactivation}>
                                <input type="hidden" name="userId" value={u.id} />
                                <ConfirmButton
                                  className="btn btn-danger btn-sm"
                                  message={`Tolak pengajuan aktivasi kembali dari "${u.name}"?`}
                                >
                                  Tolak
                                </ConfirmButton>
                              </form>
                            )}
                          </>
                        ) : (
                          u.id !== currentAdmin?.id && (
                            <form action={deleteUser}>
                              <input type="hidden" name="userId" value={u.id} />
                              <ConfirmButton message={`Nonaktifkan akun "${u.name}"?`}>
                                <LuUserX size={14} /> Nonaktifkan
                              </ConfirmButton>
                            </form>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}