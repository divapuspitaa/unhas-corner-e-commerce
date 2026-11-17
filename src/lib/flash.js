// Menambahkan ?ok=... atau ?err=... ke sebuah path untuk pesan notifikasi sederhana
export function withMsg(path, type, msg) {
  const url = new URL(path, "http://local");
  url.searchParams.delete("ok");
  url.searchParams.delete("err");
  url.searchParams.set(type, msg);
  return url.pathname + url.search;
}
