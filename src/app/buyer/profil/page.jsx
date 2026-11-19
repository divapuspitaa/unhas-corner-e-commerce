import ProfileForm from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Profil Saya" };

export default async function BuyerProfilePage() {
  const user = await requireUser("buyer");
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Profil Saya</h2>
      <ProfileForm user={user} />
    </div>
  );
}
