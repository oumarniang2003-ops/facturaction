import { describe, it, expect } from "vitest";
import { can } from "../lib/permissions";

describe("can() — matrice de permissions", () => {
  it("le OWNER peut gérer l'abonnement", () => {
    expect(can("OWNER", "billing:manage")).toBe(true);
  });

  it("un EMPLOYEE ne peut PAS gérer l'abonnement (règle de sécurité critique)", () => {
    expect(can("EMPLOYEE", "billing:manage")).toBe(false);
  });

  it("un ACCOUNTANT ne peut PAS créer de facture (lecture seule)", () => {
    expect(can("ACCOUNTANT", "invoices:write")).toBe(false);
    expect(can("ACCOUNTANT", "invoices:read")).toBe(true);
  });

  it("un EMPLOYEE peut créer des factures et des clients", () => {
    expect(can("EMPLOYEE", "invoices:write")).toBe(true);
    expect(can("EMPLOYEE", "clients:write")).toBe(true);
  });

  it("un rôle ou une permission inconnue renvoie false plutôt que de planter", () => {
    expect(can("INEXISTANT" as any, "invoices:read")).toBe(false);
    expect(can("OWNER", "permission-qui-nexiste-pas")).toBe(false);
  });
});
