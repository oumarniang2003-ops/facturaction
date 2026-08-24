// Promeut un utilisateur existant au rang de super admin.
// Usage : npm run admin:promote -- votre@email.com
const { PrismaClient } = require("@prisma/client");

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
