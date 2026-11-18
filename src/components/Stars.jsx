import { Star } from "lucide-react";

export default function Stars({ value = 0, size = 14 }) {
  const rounded = Math.round(Number(value));
  return (
    <span className="inline-flex items-center gap-0.5 text-accent">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= rounded ? "currentColor" : "none"} strokeWidth={1.8} />
      ))}
    </span>
  );
}
