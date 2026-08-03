import { app, BrowserWindow } from "electron"
import { spawn } from "node:child_process"
import path from "node:path"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import crypto from "node:crypto"
import getPort from "get-port"

const isDev = !app.isPackaged

function getOrCreateConfig(userDataPath) {
  const configPath = path.join(userDataPath, "config.json")
  if (existsSync(configPath)) {
    return JSON.parse(readFileSync(configPath, "utf-8"))
  }
  mkdirSync(userDataPath, { recursive: true })
  const config = { sessionSecret: crypto.randomBytes(32).toString("base64") }
  writeFileSync(configPath, JSON.stringify(config, null, 2))
  return config
}

function runChildToCompletion(execPath, scriptPath, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(execPath, [scriptPath, ...args], {
      env: { ...process.env, ...env, ELECTRON_RUN_AS_NODE: "1" },
      stdio: "inherit",
    })
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${path.basename(scriptPath)} exited with code ${code}`))
    })
    child.on("error", reject)
  })
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.status < 500) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Timed out waiting for server at ${url}`)
}

let serverProcess = null

async function resolveAppUrl() {
  if (isDev) {
    return "http://localhost:3000"
  }

  const userDataPath = app.getPath("userData")
  const config = getOrCreateConfig(userDataPath)
  const dbPath = path.join(userDataPath, "inventory.db")

  const standaloneDir = path.join(process.resourcesPath, "next-build", "standalone")
  const serverPath = path.join(standaloneDir, "server.js")
  const migratePath = path.join(standaloneDir, "migrate.mjs")
  const migrationsDir = path.join(standaloneDir, "migrations")

  console.log("[main] running migrations...")
  await runChildToCompletion(process.execPath, migratePath, [dbPath, migrationsDir], {})

  const port = await getPort({ port: [3000, 3001, 3002, 3003, 3004] })

  console.log(`[main] starting server on port ${port}...`)
  serverProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PORT: String(port),
      HOSTNAME: "localhost",
      DATABASE_URL: `file:${dbPath}`,
      SESSION_SECRET: config.sessionSecret,
      NODE_ENV: "production",
    },
    stdio: "inherit",
  })

  const url = `http://localhost:${port}`
  await waitForServer(`${url}/login`)
  return url
}

async function createWindow() {
  const url = await resolveAppUrl()

  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: "Inventory Dashboard",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error(`[main] page failed to load: ${errorCode} ${errorDescription}`)
  })
  win.webContents.on("did-finish-load", () => {
    console.log("[main] window loaded successfully")
  })
  win.on("ready-to-show", () => {
    console.log("[main] window ready-to-show")
  })

  win.loadURL(url)
}

process.on("uncaughtException", (err) => {
  console.error("[main] uncaught exception:", err)
})

app.whenReady().then(() => {
  console.log("[main] app ready, creating window...")
  createWindow().catch((err) => {
    console.error("[main] failed to start:", err)
    app.quit()
  })
})

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill()
  if (process.platform !== "darwin") app.quit()
})

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill()
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((err) => console.error("[main] failed to start:", err))
  }
})
