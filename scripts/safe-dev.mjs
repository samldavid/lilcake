import { assertSafeLocalDatabase, loadProjectEnv, nextExecutable, spawnLocal } from "./local-env-utils.mjs"

loadProjectEnv()
assertSafeLocalDatabase("npm run dev")

await spawnLocal(nextExecutable(), ["dev", "--webpack"])
