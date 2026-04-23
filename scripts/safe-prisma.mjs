import {
  assertSafeLocalDatabase,
  loadProjectEnv,
  prismaExecutable,
  spawnLocal,
} from "./local-env-utils.mjs"

loadProjectEnv()
assertSafeLocalDatabase(`prisma ${process.argv.slice(2).join(" ") || "command"}`)

const args = process.argv.slice(2)
if (args.length === 0) {
  throw new Error("Debes indicar el comando de Prisma que quieres ejecutar.")
}

await spawnLocal(prismaExecutable(), args)
