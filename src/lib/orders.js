// Helper transaksi pesanan (dipakai di beberapa server action)

// Ubah status pesanan + catat log. Jika dibatalkan, stok dikembalikan.
export async function changeOrderStatus(client, orderId, status, userId, note) {
  if (status === "dibatalkan") {
    await client.query(
      `UPDATE products p SET stock = p.stock + oi.quantity
       FROM order_items oi
       WHERE oi.order_id = $1 AND oi.product_id = p.id`,
      [orderId]
    );
  }
  await client.query("UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2", [status, orderId]);
  await client.query(
    "INSERT INTO order_status_logs (order_id, status, changed_by, note) VALUES ($1, $2, $3, $4)",
    [orderId, status, userId, note]
  );
}
