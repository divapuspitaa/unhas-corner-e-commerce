// Menampilkan pesan dari ?ok=... / ?err=...
export default function Notice({ ok, err }) {
  if (!ok && !err) return null;
  const good = Boolean(ok);
  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
        good
          ? "border-green-200 bg-status-success-bg text-status-success-text"
          : "border-red-200 bg-status-danger-bg text-status-danger-text"
      }`}
    >
      {ok || err}
    </div>
  );
}
