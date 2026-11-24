import StoreForm from "@/components/StoreForm";
import { requireApprovedSeller } from "@/lib/auth";
import { getStoreByUser } from "@/lib/queries";

export const metadata = { title: "Informasi Toko" };
export const dynamic = "force-dynamic";

export default async function SellerStorePage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireApprovedSeller();
  const store = await getStoreByUser(user.id);
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Informasi Toko</h2>
      <StoreForm store={store} />
    </div>
  );
}
