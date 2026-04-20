"use client"

import { Search, X } from "lucide-react"

type AdminSearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
}: AdminSearchInputProps) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lc-gray"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-xl border border-lc-border bg-lc-darker py-2 pl-10 text-sm text-lc-white transition-colors focus:border-lc-purple focus:outline-none"
        style={{ paddingRight: value ? "2.5rem" : "1rem" }}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-lc-gray transition-colors hover:text-lc-white"
          aria-label="Limpiar búsqueda"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  )
}
