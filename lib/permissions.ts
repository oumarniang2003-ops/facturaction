export type Role = "OWNER" | "EMPLOYEE" | "ACCOUNTANT";

/**
 * Matrice des permissions par rôle. À adapter selon vos besoins exacts,
 * mais donne une base cohérente :
 * - OWNER : accès total, y compris abonnement et suppression
 * - EMPLOYEE : peut créer/consulter factures, clients, produits, mais pas
 *   toucher à l'abonnement ni supprimer des données sensibles
 * - ACCOUNTANT : lecture seule sur tout, utile pour l'export comptable
 */
const PERMISSIONS: Record<Role, string[]> = {
  OWNER: ["invoices:read", "invoices:write", "invoices:delete", "clients:read", "clients:write",
          "products:read", "products:write", "billing:manage", "team:manage"],
  EMPLOYEE: ["invoices:read", "invoices:write", "clients:read", "clients:write",
             "products:read", "products:write"],
  ACCOUNTANT: ["invoices:read", "clients:read", "products:read"],
};

export function can(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * À utiliser en tête de chaque route API sensible :
 *
 *   const session = await getServerSession(authOptions);
 *   if (!can(session.role, "billing:manage")) {
 *     return NextResponse.json({ error: "Action non autorisée pour votre rôle" }, { status: 403 });
 *   }
 */
