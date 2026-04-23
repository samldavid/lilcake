import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { config as loadEnv } from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const projectRoot = path.resolve(__dirname, "..")
export const envPath = path.join(projectRoot, ".env")
export const envLocalPath = path.join(projectRoot, ".env.local")

export function loadProjectEnv() {
  loadEnv({ path: envPath })
  loadEnv({ path: envLocalPath, override: true })
}

export function sanitizeSchemaName(schemaName) {
  return schemaName.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()
}

export function defaultLocalSchemaName() {
  const username = sanitizeSchemaName(os.userInfo().username || "dev")
  return `local_${username}`
}

export function withSchema(urlString, schemaName) {
  const parsed = new URL(urlString)
  parsed.searchParams.set("schema", schemaName)
  return parsed.toString()
}

export function getDatabaseSafety(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    return {
      safe: false,
      reason: "DATABASE_URL no esta definido.",
    }
  }

  let parsed
  try {
    parsed = new URL(databaseUrl)
  } catch {
    return {
      safe: false,
      reason: "DATABASE_URL no tiene un formato de URL valido.",
    }
  }

  const host = parsed.hostname
  const schema = parsed.searchParams.get("schema") || "public"
  const isLocalHost = host === "localhost" || host === "127.0.0.1"
  const isRemote = !isLocalHost
  const safe = !isRemote || schema !== "public"

  return {
    safe,
    host,
    schema,
    isRemote,
    reason: safe
      ? ""
      : `DATABASE_URL apunta a ${host} con la schema "${schema}". Eso pisaria las tablas de produccion si compartes el mismo Postgres con Vercel.`,
  }
}

export function assertSafeLocalDatabase(commandName) {
  if (process.env.ALLOW_PRODUCTION_DATABASE === "true") {
    return
  }

  const safety = getDatabaseSafety()
  if (safety.safe) {
    return
  }

  const guidance = [
    `Bloqueado: ${commandName}.`,
    safety.reason,
    "Solucion recomendada:",
    '1. Ejecuta `npm run db:local:setup` para generar una .env.local con schema separada.',
    "2. Reinicia el servidor local.",
    "Si realmente necesitas usar la base productiva, define ALLOW_PRODUCTION_DATABASE=true de forma temporal.",
  ].join("\n")

  throw new Error(guidance)
}

export function upsertEnvValue(filePath, key, value) {
  const existing = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : ""
  const lines = existing.length > 0 ? existing.split(/\r?\n/) : []
  const nextLine = `${key}=${JSON.stringify(value)}`
  const index = lines.findIndex((line) => line.startsWith(`${key}=`))

  if (index >= 0) {
    lines[index] = nextLine
  } else {
    if (lines.length > 0 && lines[lines.length - 1] !== "") {
      lines.push("")
    }
    lines.push(nextLine)
  }

  fs.writeFileSync(filePath, `${lines.join("\n").replace(/\n+$/u, "")}\n`, "utf8")
}

export function spawnLocal(command, args) {
  return new Promise((resolve, reject) => {
    const child =
      process.platform === "win32"
        ? spawn(
            "cmd.exe",
            [
              "/d",
              "/s",
              "/c",
              `${command} ${args
                .map((arg) =>
                  /[\s"]/u.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg
                )
                .join(" ")}`,
            ],
            {
              cwd: projectRoot,
              stdio: "inherit",
              shell: false,
              env: process.env,
            }
          )
        : spawn(command, args, {
            cwd: projectRoot,
            stdio: "inherit",
            shell: false,
            env: process.env,
          })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(" ")} salio con codigo ${code ?? "desconocido"}.`))
    })
    child.on("error", reject)
  })
}

export function prismaExecutable() {
  return process.platform === "win32"
    ? path.join(projectRoot, "node_modules", ".bin", "prisma.cmd")
    : path.join(projectRoot, "node_modules", ".bin", "prisma")
}

export function nextExecutable() {
  return process.platform === "win32"
    ? path.join(projectRoot, "node_modules", ".bin", "next.cmd")
    : path.join(projectRoot, "node_modules", ".bin", "next")
}
