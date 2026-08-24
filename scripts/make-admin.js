// Promeut un utilisateur existant au rang de super admin.
// Usage : npm run admin:promote -- votre@email.com
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

// `node` ne charge pas .env tout seul (contrairement à `next dev`) : on le
// fait ici pour que DATABASE_URL soit disponible.
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const key = match[1];
      const value = (match[2] || "").trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run admin:promote -- votre@email.com");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isSuperAdmin: true },
  });

  console.log(`✅ ${user.email} est maintenant super admin. Reconnectez-vous pour voir l'onglet "Super Admin".`);
}

main()
  .catch((err) => {
    console.error("Erreur :", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
