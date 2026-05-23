"use client";

import { useState } from "react";
import { applyMask, type MaskKind } from "@/lib/masks";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "defaultValue"> & {
  mask: MaskKind;
  defaultValue?: string;
  name: string;
};

export function MaskedInput({ mask, defaultValue, ...rest }: Props) {
  const [value, setValue] = useState(() => applyMask(mask, defaultValue ?? ""));

  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => setValue(applyMask(mask, e.target.value))}
      inputMode={mask === "cnpj" || mask === "cpf" || mask === "cep" ? "numeric" : "tel"}
      autoComplete="off"
    />
  );
}
