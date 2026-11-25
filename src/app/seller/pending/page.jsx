import { redirect } from "next/navigation";
import { LuClock, LuMail, LuTriangleAlert, LuX } from "react-icons/lu";
import ConfirmButton from "@/components/ConfirmButton";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { deleteRejectedAccount } from "@/actions/auth";
import { ensureSellerVerificationColumns } from "@/lib/sellerVerification";

export const metadata = { title: "Status Peninjauan Toko" };
export const dynamic = "force-dynamic";

export default async function PendingSellerPage() {
  const user = await requireUser("seller");
  if (user.seller_status === "approved") redirect("/seller/dashboard");

  await ensureSellerVerificationColumns();
  const { rows } = await query(
    "SELECT seller_status, rejection_reason FROM users WHERE id = $1",
    [user.id]
  );
  const sellerStatus = rows[0]?.seller_status ?? user.seller_status;
  const rejectionReason = rows[0]?.rejection_reason;
  const rejected = sellerStatus === "rejected";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="card p-8 text-center">
        <span
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            rejected
              ? "bg-status-danger-bg text-status-danger-text"
              : "bg-status-pending-bg text-status-pending-text"
          }`}
        >
          {rejected ? <LuX size={32} /> : <LuClock size={32} />}
        </span>
        {rejected ? (
          <>
            <h1 className="mt-4 text-2xl font-bold">Pendaftaran Ditolak</h1>
            <p className="mt-2 text-sm text-muted">
              Maaf, pendaftaran toko Anda telah ditolak oleh admin dan tidak dapat disetujui kembali. Jika ingin mendaftar lagi, silakan hapus akun ini terlebih dahulu lalu daftar ulang dari awal.
            </p>

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50/70 p-4 text-left text-sm text-red-950">
              <p className="flex items-center gap-1.5 font-bold text-red-900">
                <LuTriangleAlert size={16} className="shrink-0 text-red-600" />
                Alasan Penolakan dari Admin
              </p>
              <p className="mt-1 text-xs leading-relaxed text-red-800">
                {rejectionReason || "Data identitas yang Anda ajukan belum memenuhi syarat verifikasi."}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-line bg-surface/70 p-4 text-left text-sm">
              <p className="flex items-center gap-1.5 font-bold text-ink">
                <LuMail size={16} className="shrink-0 text-primary" />
                Contact Center Admin
              </p>
              <p className="mt-1 text-xs text-muted">
                Butuh bantuan atau klarifikasi terkait penolakan? Hubungi Admin melalui email:{" "}
                <a
                  href="mailto:admin@unhascorner.id"
                  className="font-semibold text-primary underline"
                >
                  admin@unhascorner.id
                </a>
              </p>
            </div>

            <form action={deleteRejectedAccount} className="mt-6">
              <ConfirmButton
                message="Hapus akun ini agar Anda bisa mendaftar ulang dari awal?"
                className="btn btn-danger"
              >
                Hapus Akun &amp; Daftar Ulang
              </ConfirmButton>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-bold">Akun Anda sedang ditinjau</h1>
            <p className="mt-2 text-sm text-muted">
              Halo {user.name}, admin UnhasCorner sedang memverifikasi pendaftaran toko Anda. Dashboard akan terbuka setelah disetujui.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
