import Notice from "@/components/Notice";
import { SellerBadge } from "@/components/Badge";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { setSellerStatus } from "@/actions/admin";

export const metadata = { title: "Verifikasi Seller" };
export const dynamic = "force-dynamic";

export default async function VerificationPage({ searchParams }) {
  const sp = await searchParams;
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.seller_status, u.created_at, s.name AS store_name
     FROM users u LEFT JOIN stores s ON s.user_id = u.id
     WHERE u.role = 'seller' AND u.seller_status IN ('pending','rejected')
     ORDER BY (u.seller_status = 'pending') DESC, u.created_at DESC`
  );

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Verifikasi Seller</h2>
      <Notice ok={sp.ok} err={sp.err} />
      {rows.length === 0 && <div className="card p-8 text-center text-muted">Tidak ada pendaftaran seller yang menunggu.</div>}
      <div className="space-y-3">
        {rows.map((u) => (
          <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="flex items-center gap-2 font-semibold">{u.name} <SellerBadge status={u.seller_status} /></p>
              <p className="text-muted">{u.email} · {u.phone ?? "-"}</p>
              <p className="text-muted">Toko: {u.store_name ?? "(belum ada)"} · Daftar {formatDate(u.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <form action={setSellerStatus}>
                <input type="hidden" name="userId" value={u.id} />
                <input type="hidden" name="status" value="approved" />
                <button className="btn btn-primary btn-sm">Approve</button>
              </form>
              {u.seller_status === "pending" && (
                <form action={setSellerStatus}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button className="btn btn-danger btn-sm">Reject</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
