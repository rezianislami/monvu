import * as React from "react";
import { Input } from "@/components/ui/input";

// Rupiah input: shows id-ID thousand separators (30.000.000) while keeping the
// raw digit string as the value. onValueChange emits digits only, so callers
// keep doing Number(value) unchanged. IDR has no cents, so we strip everything
// that isn't a digit (no decimal handling on purpose).
function formatGrouped(digits: string): string {
  if (!digits) return "";
  const n = Number(digits);
  return Number.isFinite(n) ? n.toLocaleString("id-ID") : "";
}

export function CurrencyInput({
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (raw: string) => void;
}) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={formatGrouped(value)}
      onChange={(e) => onValueChange(e.target.value.replace(/\D/g, ""))}
    />
  );
}
