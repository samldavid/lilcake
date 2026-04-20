"use client"

import { CheckCircle2, Circle } from "lucide-react"
import {
  getPasswordRuleChecks,
  PASSWORD_REQUIREMENT_LABELS,
  passwordContainsIdentity,
} from "@/lib/password-policy"

type PasswordRequirementsProps = {
  password: string
  identityValues?: Array<string | null | undefined>
}

export function PasswordRequirements({
  password,
  identityValues = [],
}: PasswordRequirementsProps) {
  const checks = getPasswordRuleChecks(password)
  const excludesIdentity = !passwordContainsIdentity(password, identityValues)

  const items = [
    { label: PASSWORD_REQUIREMENT_LABELS.minLength, valid: checks.minLength },
    { label: PASSWORD_REQUIREMENT_LABELS.uppercase, valid: checks.uppercase },
    { label: PASSWORD_REQUIREMENT_LABELS.lowercase, valid: checks.lowercase },
    { label: PASSWORD_REQUIREMENT_LABELS.number, valid: checks.number },
    { label: PASSWORD_REQUIREMENT_LABELS.symbol, valid: checks.symbol },
    { label: PASSWORD_REQUIREMENT_LABELS.excludesIdentity, valid: excludesIdentity },
  ]

  return (
    <div className="rounded-xl border border-lc-border bg-lc-darker/60 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-lc-gray">
        Requisitos de contraseña
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 text-sm ${
              item.valid ? "text-emerald-300" : "text-lc-gray"
            }`}
          >
            {item.valid ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
