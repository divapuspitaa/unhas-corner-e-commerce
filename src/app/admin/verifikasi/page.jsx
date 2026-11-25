import { LuTriangleAlert, LuIdCard } from "react-icons/lu";
import { SellerBadge } from "@/components/Badge";
import SafeImage from "@/components/SafeImage";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { setSellerStatus } from "@/actions/admin";
import { analyzeSellerVerification, ensureSellerVerificationColumns } from "@/lib/sellerVerification";

export const metadata = { title: "Verifikasi Seller" };
export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  await ensureSellerVerificationColumns();
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.seller_status, u.created_at,
            u.nik, u.ktp_image_url, u.selfie_image_url, u.ktp_blur_score, u.selfie_blur_score,
            u.rejection_reason, s.name AS store_name, s.address AS store_address
     FROM users u LEFT JOIN stores s ON s.user_id = u.id
     WHERE u.role = 'seller' AND u.seller_status IN ('pending','rejected')
     ORDER BY (u.seller_status = 'pending') DESC, u.created_at DESC`
  );

  const sellersWithIssues = await Promise.all(
    rows.map(async (u) => ({
      ...u,
      issues: await analyzeSellerVerification(u),
    }))
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Verifikasi Seller</h2>
      {sellersWithIssues.length === 0 && (
        <div className="card p-8 text-center text-muted">
          Tidak ada pendaftaran seller yang menunggu.
        </div>
      )}
      <div className="space-y-4">
        {sellersWithIssues.map((u) => (
          <div key={u.id} className="card space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  {u.name} <SellerBadge status={u.seller_status} />
                </p>
                <p className="text-muted">
                  {u.email} · {u.phone ?? "-"}
                </p>
                <p className="text-muted">
                  Toko: {u.store_name ?? "(belum ada)"} · Daftar {formatDate(u.created_at)}
                </p>
                {u.store_address && (
                  <p className="text-xs text-muted">Alamat Toko: {u.store_address}</p>
                )}
                <p className="flex items-center gap-1.5 text-xs font-medium text-ink">
                  <LuIdCard size={14} className="text-primary" />
                  NIK: <span className="font-mono">{u.nik || "(belum diisi)"}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {u.seller_status === "pending" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={setSellerStatus}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="btn btn-primary btn-sm">Approve</button>
                    </form>
                    <form action={setSellerStatus} className="flex flex-wrap items-center gap-1.5">
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <input
                        name="rejectionReason"
                        defaultValue={u.issues.join("; ")}
                        placeholder="Alasan penolakan (mis. NIK kurang)"
                        className="input h-8 w-56 px-2.5 py-1 text-xs"
                      />
                      <button className="btn btn-danger btn-sm">Reject</button>
                    </form>
                  </div>
                ) : (
                  <span className="rounded-full bg-status-danger-bg px-3 py-1 text-xs font-semibold text-status-danger-text">
                    Ditolak permanen — harus daftar ulang dari awal
                  </span>
                )}
              </div>
            </div>

            {u.seller_status === "rejected" && u.rejection_reason && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-900">
                <span className="font-bold">Alasan Penolakan:</span> {u.rejection_reason}
              </div>
            )}

            {u.issues.length > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-950">
                <p className="flex items-center gap-1.5 font-bold text-amber-900">
                  <LuTriangleAlert size={15} className="shrink-0 text-amber-600" />
                  Peringatan Kelengkapan / Kualitas Data:
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {u.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-surface/50 p-2.5">
                <p className="mb-1.5 text-xs font-semibold text-muted">Foto KTP</p>
                {u.ktp_image_url ? (
                  <a href={u.ktp_image_url} target="_blank" rel="noreferrer" className="block">
                    <SafeImage
                      src={u.ktp_image_url}
                      alt={`Foto KTP ${u.name}`}
                      className="h-40 w-full rounded-lg border border-line bg-white object-cover"
                    />
                  </a>
                ) : (
                  <p className="py-8 text-center text-xs text-muted">Tidak ada foto KTP</p>
                )}
              </div>

              <div className="rounded-xl border border-line bg-surface/50 p-2.5">
                <p className="mb-1.5 text-xs font-semibold text-muted">Foto Diri (Selfie)</p>
                {u.selfie_image_url ? (
                  <a href={u.selfie_image_url} target="_blank" rel="noreferrer" className="block">
                    <SafeImage
                      src={u.selfie_image_url}
                      alt={`Foto diri ${u.name}`}
                      className="h-40 w-full rounded-lg border border-line bg-white object-cover"
                    />
                  </a>
                ) : (
                  <p className="py-8 text-center text-xs text-muted">Tidak ada foto diri</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
