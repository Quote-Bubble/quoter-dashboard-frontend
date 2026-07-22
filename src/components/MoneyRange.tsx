"use client";

import { useEffect, useRef, useState } from "react";

import { formatMoney, formatQuoteRange } from "@/lib/format";

/** Count a number up from 0 to `target` once, when `active` is true. */
function useCountUp(target: number, active: boolean, duration = 700): number {
  const [value, setValue] = useState(active ? 0 : target);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) {
      setValue(target);
      return;
    }
    started.current = true;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return value;
}

export default function MoneyRange({
  min,
  max,
  animate,
}: {
  min: number | null;
  max: number | null;
  animate: boolean;
}) {
  const hasRange = min != null && max != null;
  const lo = useCountUp(min ?? 0, animate && hasRange);
  const hi = useCountUp(max ?? 0, animate && hasRange);

  if (!hasRange) return <span>—</span>;
  if (!animate) return <span>{formatQuoteRange(min, max)}</span>;
  return (
    <span>
      {min === max
        ? formatMoney(hi)
        : `${formatMoney(lo)} – ${formatMoney(hi)}`}
    </span>
  );
}
