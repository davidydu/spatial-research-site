import { spawnSync } from "node:child_process"
import { access, cp, realpath } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

const siteRoot = fileURLToPath(new URL("../", import.meta.url))

async function main() {
  const { values } = parseArgs({
    options: {
      directory: { type: "string", short: "d", default: "content" },
      help: { type: "boolean", short: "h", default: false },
    },
  })

  if (values.help) {
    console.log("Usage: npm run build:site -- [--directory <vault-directory>]")
    return
  }

  const directory = await realpath(resolve(siteRoot, values.directory))
  const presentation = resolve(siteRoot, "presentation")
  await access(resolve(presentation, "index.html"))

  const build = spawnSync(
    process.execPath,
    [resolve(siteRoot, "quartz/bootstrap-cli.mjs"), "build", "--directory", directory],
    { cwd: siteRoot, stdio: "inherit" },
  )
  if (build.error) throw build.error
  if (build.status !== 0) {
    process.exitCode = build.status ?? 1
    return
  }

  await cp(presentation, resolve(siteRoot, "public/presentation"), { recursive: true })
  console.log("Presentation copied to public/presentation/")
}

main().catch((error) => {
  console.error(`Site build failed: ${error.message}`)
  process.exitCode = 1
})
