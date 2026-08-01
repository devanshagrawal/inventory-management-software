import { config } from "dotenv"

config({ path: ".env.local" })

const bcrypt = (await import("bcryptjs")).default
const { prisma } = await import("../src/lib/db")

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com"
  const password = process.env.ADMIN_PASSWORD ?? "changeme123"

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: "admin",
      fullName: "Admin",
    },
  })

  console.log(`Admin user ready: ${user.email} (role: ${user.role})`)
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Default password: ${password} — change this after first login.`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
