import { redirect } from "next/navigation";
import { LuClock, LuX } from "react-icons/lu";
import ConfirmButton from "@/components/ConfirmButton";
import { requireUser } from "@/lib/auth";
import { deleteRejectedAccount } from "@/actions/auth";

export const metadata = { title: "Status Peninjauan Toko" };
export const dynamic = "force-dynamic";

export default async function PendingSellerPage() {
  const user = await requireUser("seller");
  if (user.seller_status === "approved") redirect("/seller/dashboard");
  const rejected = user.seller_status === "rejected";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="card p-8 text-center">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${rejected ? "bg-status-danger-bg text-status-danger-text" : "bg-status-pending-bg text-status-pending-text"}`}>
          {rejected ? <LuX size={32} /> : <LuClock size={32} />}
        </span>
        {rejected ? (
          <>
            <h1 className="mt-4 text-2xl font-bold">Pendaftaran Ditolak</h1>
            <p className="mt-2 text-sm text-muted">
              Maaf, pendaftaran toko Anda tidak disetujui oleh admin. Anda dapat menghapus akun ini dan mendaftar ulang.
            </p>
            <form action={deleteRejectedAccount} className="mt-6">
              <ConfirmButton message="Hapus akun secara permanen?" className="btn btn-danger">Delete Account</ConfirmButton>
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
