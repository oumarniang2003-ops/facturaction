import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * À utiliser en tête de chaque page/route super admin. Retourne la session
 * si l'utilisateur est super admin, sinon `null` (à traiter par l'appelant :
 * redirect() côté page, 403 côté route API).
 */
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).isSuperAdmin) return null;
  return session;
}
