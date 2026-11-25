import StoreForm from "@/components/StoreForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { requireApprovedSeller } from "@/lib/auth";
import { getStoreByUser } from "@/lib/queries";

export const metadata = { title: "Informasi Toko" };
export const dynamic = "force-dynamic";

export default async function SellerStorePage() {
  const user = await requireApprovedSeller();
  const store = await getStoreByUser(user.id);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Informasi Toko</h2>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <StoreForm store={store} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
