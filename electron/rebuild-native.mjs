// Produces an Electron-ABI build of better-sqlite3's native binary and
// saves it to electron/prebuilt/, without leaving the real node_modules
// copy broken for normal `npm run dev` (which runs under system Node).
//
// Must be run natively on each target platform — there is no cross-platform
// path here. Mac: run this locally. Windows: run in CI on a windows-latest
// runner (see .github/workflows/build-windows.yml).
import { execFileSync } from "node:child_process"
import { copyFileSync, mkdirSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(root, "..")

const binaryPath = path.join(
  projectRoot,
  "node_modules/better-sqlite3/build/Release/better_sqlite3.node"
)
const backupPath = path.join(root, ".better_sqlite3.system-abi.node.bak")

const electronVersion = JSON.parse(
  execFileSync("node", ["-p", "JSON.stringify(require('./node_modules/electron/package.json').version)"], {
    cwd: projectRoot,
  }).toString()
)

const platform = process.platform
const arch = process.arch
const outDir = path.join(root, "prebuilt")
const outPath = path.join(outDir, `better_sqlite3-${platform}-${arch}-electron.node`)

if (!existsSync(binaryPath)) {
  console.error(`Expected to find ${binaryPath} — run \`npm install\` first.`)
  process.exit(1)
}

console.log(`Backing up current (system-ABI) binary...`)
copyFileSync(binaryPath, backupPath)

try {
  console.log(
    `Rebuilding better-sqlite3 for Electron ${electronVersion} (${platform}/${arch}) — this compiles from source, can take a minute...`
  )
  execFileSync(
    "npx",
    [
      "electron-rebuild",
      "--version",
      electronVersion,
      "--module-dir",
      ".",
      "--which-module",
      "better-sqlite3",
      "--arch",
      arch,
      "--force",
    ],
    { cwd: projectRoot, stdio: "inherit" }
  )

  mkdirSync(outDir, { recursive: true })
  copyFileSync(binaryPath, outPath)
  console.log(`Saved Electron-ABI binary -> ${path.relative(projectRoot, outPath)}`)
} finally {
  console.log("Restoring system-ABI binary for local dev use...")
  copyFileSync(backupPath, binaryPath)
}
