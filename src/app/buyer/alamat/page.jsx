import AddressForm from "@/components/AddressForm";
import ConfirmButton from "@/components/ConfirmButton";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { deleteAddress, setDefaultAddress } from "@/actions/profile";

export const metadata = { title: "Alamat Pengiriman" };
export const dynamic = "force-dynamic";

export default async function AddressPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser("buyer");
  const { rows } = await query("SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id", [user.id]);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.length === 0 && <p className="text-sm text-muted">Belum ada alamat tersimpan.</p>}
        {rows.map((a) => (
          <div key={a.id} className="card p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              {a.label}
              {a.is_default && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-primary-dark">UTAMA</span>}
            </p>
            <p>{a.recipient_name} · {a.phone}</p>
            <p className="text-muted">{a.full_address}, {a.city} {a.postal_code}</p>
            <div className="mt-3 flex gap-2">
              {!a.is_default && (
                <form action={setDefaultAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="btn btn-outline btn-sm">Jadikan utama</button>
                </form>
              )}
              <form action={deleteAddress}>
                <input type="hidden" name="id" value={a.id} />
                <ConfirmButton message="Hapus alamat ini?">Hapus</ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </div>
      <AddressForm />
    </div>
  );
}
