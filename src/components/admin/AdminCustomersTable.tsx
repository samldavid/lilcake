"use client"

import * as React from "react"
import { useDeferredValue } from "react"
import { AdminSearchInput } from "@/components/admin/AdminSearchInput"
import { scoreAdminSearchMatch } from "@/lib/admin-search"

export type AdminCustomerRow = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  password: string | null
  createdAt: string
  _count: {
    orders: number
  }
  accounts: Array<{
    provider: string
  }>
}

type AdminCustomersTableProps = {
  users: AdminCustomerRow[]
}

export function AdminCustomersTable({ users }: AdminCustomersTableProps) {
  const [query, setQuery] = React.useState("")
  const deferredQuery = useDeferredValue(query)
  const activeQuery = deferredQuery.trim()

  const filteredUsers = activeQuery
    ? users
        .map((user) => {
          const displayName =
            user.name?.trim() || user.email?.split("@")[0] || "Cliente"
          const accessMethods = [
            ...(user.password ? ["Correo"] : []),
            ...new Set(
              user.accounts.map((account) =>
                account.provider === "google" ? "Google" : account.provider
              )
            ),
          ]

          const score = scoreAdminSearchMatch(activeQuery, [
            displayName,
            user.email,
            user.phone,
            accessMethods.join(" "),
            `${user._count.orders} pedidos`,
          ])

          return {
            user,
            displayName,
            accessMethods,
            score,
          }
        })
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score
          }

          return right.user.createdAt.localeCompare(left.user.createdAt)
        })
    : users.map((user) => ({
        user,
        displayName: user.name?.trim() || user.email?.split("@")[0] || "Cliente",
        accessMethods: [
          ...(user.password ? ["Correo"] : []),
          ...new Set(
            user.accounts.map((account) =>
              account.provider === "google" ? "Google" : account.provider
            )
          ),
        ],
        score: 1,
      }))

  return (
    <div className="overflow-hidden rounded-2xl border border-lc-border bg-lc-card shadow-sm">
      <div className="space-y-3 border-b border-lc-border p-4 sm:p-5">
        <div className="max-w-xl">
          <AdminSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, email, telefono o acceso..."
          />
        </div>
        <p className="text-xs text-lc-gray">
          {query.trim()
            ? `${filteredUsers.length} clientes coinciden con tu busqueda`
            : `${users.length} clientes cargados`}
        </p>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="px-6 py-12 text-center text-lc-gray">
          {query.trim()
            ? `No encontramos clientes que coincidan con "${query.trim()}".`
            : "No hay clientes registrados aun."}
        </div>
      ) : null}

      {filteredUsers.length > 0 ? (
        <div className="grid gap-4 p-4 md:hidden">
          {filteredUsers.map(({ user, displayName, accessMethods }) => {
            const displayInitial = displayName.charAt(0).toUpperCase()

            return (
              <article
                key={user.id}
                className="rounded-2xl border border-lc-border bg-lc-darker/40 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-lc-purple to-lc-pink text-sm font-bold text-white shadow-lg">
                    {displayInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-lc-white">
                          {displayName}
                        </h3>
                        <p className="mt-1 truncate text-xs text-lc-gray">
                          {user.email}
                        </p>
                      </div>
                      <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-lc-purple/20 bg-lc-purple/10 px-3 text-sm font-bold text-lc-purple">
                        {user._count.orders}
                      </div>
                    </div>

                    {user.phone ? (
                      <p className="mt-3 text-sm text-lc-white">{user.phone}</p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {accessMethods.length === 0 ? (
                        <span className="rounded-full border border-lc-border px-3 py-1 text-xs text-lc-gray">
                          Sin acceso
                        </span>
                      ) : (
                        accessMethods.map((method) => (
                          <span
                            key={method}
                            className="rounded-full border border-lc-purple/20 bg-lc-purple/10 px-3 py-1 text-xs font-semibold text-lc-purple"
                          >
                            {method}
                          </span>
                        ))
                      )}
                    </div>

                    <p className="mt-4 text-xs text-lc-gray">
                      Registro: {new Date(user.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      {filteredUsers.length > 0 ? (
        <div className="hidden overflow-x-auto custom-scrollbar md:block">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="border-b border-lc-border bg-lc-darker">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Cliente
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Contacto
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Acceso
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Pedidos Completados
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Fecha de Registro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {filteredUsers.map(({ user, displayName, accessMethods }) => {
                const displayInitial = displayName.charAt(0).toUpperCase()

                return (
                  <tr key={user.id} className="transition-colors hover:bg-lc-dark/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-lc-purple to-lc-pink text-sm font-bold text-white shadow-lg">
                          {displayInitial}
                        </div>
                        <div className="text-sm font-bold text-lc-white">
                          {displayName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-lc-white">{user.email}</div>
                      {user.phone ? (
                        <div className="mt-0.5 text-xs text-lc-gray">
                          {user.phone}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {accessMethods.length === 0 ? (
                          <span className="rounded-full border border-lc-border px-3 py-1 text-xs text-lc-gray">
                            Sin acceso
                          </span>
                        ) : (
                          accessMethods.map((method) => (
                            <span
                              key={method}
                              className="rounded-full border border-lc-purple/20 bg-lc-purple/10 px-3 py-1 text-xs font-semibold text-lc-purple"
                            >
                              {method}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-lc-purple/20 bg-lc-purple/10 font-bold text-lc-purple">
                        {user._count.orders}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-lc-gray">
                      {new Date(user.createdAt).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
