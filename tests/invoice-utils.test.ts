import { describe, it, expect } from "vitest";
import { computeInvoiceTotals } from "../lib/invoice-utils";

describe("computeInvoiceTotals", () => {
  it("calcule correctement une seule ligne avec TVA", () => {
    const result = computeInvoiceTotals([
      { description: "Produit A", quantity: 2, unitPrice: 1000, vatRate: 20 },
    ]);

    expect(result.subtotal).toBe(2000);
    expect(result.vatTotal).toBe(400);
    expect(result.total).toBe(2400);
    expect(result.items[0].lineTotal).toBe(2400);
  });

  it("additionne correctement plusieurs lignes à des taux de TVA différents", () => {
    const result = computeInvoiceTotals([
      { description: "Produit A", quantity: 1, unitPrice: 1000, vatRate: 20 },
      { description: "Produit B", quantity: 3, unitPrice: 500, vatRate: 10 },
    ]);

    // A: 1000 + 200 TVA = 1200
    // B: 1500 + 150 TVA = 1650
    expect(result.subtotal).toBe(2500);
    expect(result.vatTotal).toBe(350);
    expect(result.total).toBe(2850);
  });

  it("gère une TVA à 0% (cas fréquent au Sénégal pour certains produits/services)", () => {
    const result = computeInvoiceTotals([
      { description: "Service exonéré", quantity: 1, unitPrice: 5000, vatRate: 0 },
    ]);

    expect(result.vatTotal).toBe(0);
    expect(result.total).toBe(5000);
  });

  it("gère une liste vide sans planter", () => {
    const result = computeInvoiceTotals([]);

    expect(result.items).toEqual([]);
    expect(result.subtotal).toBe(0);
    expect(result.vatTotal).toBe(0);
    expect(result.total).toBe(0);
  });

  it("arrondit correctement à 2 décimales (évite les erreurs de virgule flottante)", () => {
    const result = computeInvoiceTotals([
      { description: "Produit", quantity: 3, unitPrice: 33.33, vatRate: 18 },
    ]);

    // 3 × 33.33 = 99.99, vérifie qu'on n'a pas un résultat du type 99.98999999999999
    expect(result.subtotal).toBe(99.99);
    expect(Number.isFinite(result.total)).toBe(true);
  });
});
