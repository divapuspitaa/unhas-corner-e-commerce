import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Profil Saya" };

export default async function BuyerProfilePage() {
  const user = await requireUser("buyer");
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Profil Saya</h2>
      <ProfileForm user={user} />
      <ChangePasswordForm />
    </div>
  );
}
