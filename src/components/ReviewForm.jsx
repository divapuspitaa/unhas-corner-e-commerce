"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { submitReview } from "@/actions/orders";

export default function ReviewForm({ orderId, productId, initialRating = 0, initialComment = "" }) {
  const [rating, setRating] = useState(initialRating);
  return (
    <form action={submitReview} className="mt-2 space-y-2 rounded-lg bg-base p-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} bintang`} className="text-accent">
            <Star size={20} fill={i <= rating ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <textarea name="comment" defaultValue={initialComment} rows={2} placeholder="Tulis ulasan kamu..." className="input" />
      <SubmitButton className="btn btn-primary btn-sm" pendingText="Menyimpan..." disabled={rating === 0}>
        Kirim Ulasan
      </SubmitButton>
    </form>
  );
}
