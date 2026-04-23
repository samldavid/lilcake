"use client"

import * as React from "react"
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  LoaderCircle,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  getAdminDemoReportSummary,
} from "@/lib/admin-demo-data"
import { DEFAULT_REPORT_FILTERS, type ReportFilters } from "@/lib/business-reports"

const REPORT_KIND_OPTIONS = [
  { value: "sales", label: "Ventas" },
  { value: "orders", label: "Pedidos" },
  { value: "customers", label: "Clientes" },
] as const

const REPORT_PRESET_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "last7", label: "Ultimos 7 dias" },
  { value: "last30", label: "Ultimos 30 dias" },
  { value: "thisMonth", label: "Mes actual" },
  { value: "custom", label: "Rango personalizado" },
] as const

export function BusinessExportDemoPanel() {
  const [filters, setFilters] = React.useState<ReportFilters>(DEFAULT_REPORT_FILTERS)
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [loadingExport, setLoadingExport] = React.useState<"xlsx" | "pdf" | null>(
    null
  )

  const customRangeIncomplete =
    filters.preset === "custom" && (!filters.startDate || !filters.endDate)

  const summary = React.useMemo(() => getAdminDemoReportSummary(filters), [filters])

  const handleExport = async (format: "xlsx" | "pdf") => {
    if (customRangeIncomplete) {
      setFeedback({
        type: "error",
        message: "Completa la fecha inicial y final para exportar ese rango.",
      })
      return
    }

    try {
      setLoadingExport(format)
      setFeedback(null)

      const searchParams = new URLSearchParams({
        kind: filters.kind,
        preset: filters.preset,
        format,
      })

      if (filters.startDate) {
        searchParams.set("startDate", filters.startDate)
      }

      if (filters.endDate) {
        searchParams.set("endDate", filters.endDate)
      }

      const response = await fetch(`/api/demo/reports/export?${searchParams}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "No pudimos generar la exportacion demo.")
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get("content-disposition") || ""
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i)
      const fileName =
        filenameMatch?.[1] || `lilcake-demo-${filters.kind}.${format}`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setFeedback({
        type: "success",
        message: `Reporte demo exportado correctamente en ${format === "xlsx" ? "Excel" : "PDF"}.`,
      })
    } catch (exportError) {
      setFeedback({
        type: "error",
        message:
          exportError instanceof Error
            ? exportError.message
            : "No pudimos exportar el reporte demo.",
      })
    } finally {
      setLoadingExport(null)
    }
  }

  return (
    <div className="card group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lc-purple/10 via-transparent to-lc-cyan/10" />
      <div className="relative z-10 space-y-8 p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lc-purple/20 bg-lc-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-lc-purple">
              <Filter size={14} />
              Centro de exportacion demo
            </div>
            <h3 className="mt-4 text-2xl font-heading font-bold text-lc-white">
              Explora reportes y exportaciones sin tocar datos reales
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-lc-gray-light">
              Filtra por ventas, pedidos o clientes y prueba la experiencia de exportacion
              en un entorno seguro pensado para demos comerciales.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              disabled={customRangeIncomplete || loadingExport !== null}
              onClick={() => void handleExport("xlsx")}
            >
              {loadingExport === "xlsx" ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
              Exportar Excel
            </Button>
            <Button
              type="button"
              className="gap-2"
              disabled={customRangeIncomplete || loadingExport !== null}
              onClick={() => void handleExport("pdf")}
            >
              {loadingExport === "pdf" ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1.5 ml-1 block text-sm font-medium text-lc-gray-light">
              Tipo de reporte
            </label>
            <select
              className="input-field"
              value={filters.kind}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  kind: event.target.value as ReportFilters["kind"],
                }))
              }
            >
              {REPORT_KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 ml-1 block text-sm font-medium text-lc-gray-light">
              Rango
            </label>
            <select
              className="input-field"
              value={filters.preset}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  preset: event.target.value as ReportFilters["preset"],
                  ...(event.target.value !== "custom"
                    ? { startDate: undefined, endDate: undefined }
                    : {}),
                }))
              }
            >
              {REPORT_PRESET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="date"
            label="Desde"
            disabled={filters.preset !== "custom"}
            value={filters.startDate || ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                startDate: event.target.value || undefined,
              }))
            }
          />

          <Input
            type="date"
            label="Hasta"
            disabled={filters.preset !== "custom"}
            value={filters.endDate || ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                endDate: event.target.value || undefined,
              }))
            }
          />
        </div>

        {customRangeIncomplete ? (
          <div className="rounded-2xl border border-lc-warning/30 bg-lc-warning/10 p-4 text-sm text-lc-warning">
            Completa la fecha inicial y final para simular un rango personalizado.
          </div>
        ) : null}

        {feedback ? (
          <div
            className={`rounded-2xl p-4 text-sm ${
              feedback.type === "success"
                ? "border border-lc-cyan/30 bg-lc-cyan/10 text-lc-cyan"
                : "border border-lc-error/30 bg-lc-error/10 text-lc-error"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr,0.9fr]">
          <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-lc-white">{summary.title}</h4>
                <p className="mt-1 text-sm text-lc-gray-light">{summary.description}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-lc-border px-3 py-1 text-xs text-lc-gray-light">
                <Download size={14} />
                {summary.rangeLabel}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {summary.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-lc-border bg-lc-black/20 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-xl font-heading font-bold text-lc-white">
                    {metric.value}
                  </p>
                  {metric.hint ? (
                    <p className="mt-1 text-xs text-lc-gray-light">{metric.hint}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-5 sm:p-6">
            <h4 className="text-lg font-bold text-lc-white">Vista previa y alcance</h4>
            <p className="mt-2 text-sm leading-7 text-lc-gray-light">
              El reporte demo incluye{" "}
              <span className="font-semibold text-lc-white">{summary.rowCount}</span>{" "}
              filas y te deja mostrar una experiencia realista de analitica exportable.
            </p>

            <div className="mt-5 space-y-3">
              {summary.notes.map((note) => (
                <div
                  key={note}
                  className="rounded-xl border border-lc-border bg-lc-black/20 px-4 py-3 text-sm text-lc-gray-light"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-5 sm:p-6">
          <h4 className="text-lg font-bold text-lc-white">Muestra rapida del reporte</h4>
          <p className="mt-1 text-sm text-lc-gray-light">
            Asi se ve la tabla base antes de exportar.
          </p>

          <div className="mt-4 overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-lc-border">
                  {summary.previewColumns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lc-gray"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.previewRows.map((row, rowIndex) => (
                  <tr
                    key={`${rowIndex}-${row.join("-")}`}
                    className="border-b border-lc-border/60 hover:bg-lc-black/20"
                  >
                    {row.map((value, cellIndex) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        className="px-4 py-3 text-lc-gray-light"
                      >
                        {value || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
