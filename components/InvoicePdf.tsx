import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

function formatCFA(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica", color: "#1B2320" },
  
  // Header with Teal/Cyan border
  headerContainer: {
    borderWidth: 2,
    borderColor: "#0096B4",
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0096B4",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  businessSubtitle: {
    fontSize: 8,
    textAlign: "center",
    color: "#555",
    marginBottom: 6,
    fontStyle: "italic",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: "#E6F4F8",
    paddingTop: 4,
    fontSize: 8,
    color: "#333",
  },

  // Document Badge & Meta Row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dottedLabel: {
    fontSize: 9,
    color: "#333",
    fontWeight: "bold",
  },
  dottedValue: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#0096B4",
    minWidth: 90,
    textAlign: "center",
    fontSize: 9,
    paddingBottom: 1,
    marginLeft: 4,
  },
  docBadgeContainer: {
    backgroundColor: "#0096B4",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 3,
  },
  docBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  docNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#DC2626", // Red color for number
  },

  // Client Details with dotted underlines
  clientContainer: {
    marginBottom: 15,
    gap: 6,
  },
  clientFieldRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientFieldLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0096B4",
    width: 65,
  },
  clientFieldValue: {
    flex: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#0096B4",
    paddingBottom: 1,
    fontSize: 9,
    color: "#1B2320",
  },
  clientSubRow: {
    flexDirection: "row",
    gap: 15,
  },

  // Lined Ledger Table
  table: {
    borderWidth: 2,
    borderColor: "#0096B4",
    borderRadius: 4,
    marginBottom: 15,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E6F4F8",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0096B4",
    paddingVertical: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E6F4F8",
    paddingVertical: 5,
  },
  colQty: { 
    width: "15%", 
    borderRightWidth: 1, 
    borderRightColor: "#0096B4",
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  colDesc: { 
    width: "55%", 
    borderRightWidth: 1, 
    borderRightColor: "#0096B4",
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  colPrice: { 
    width: "15%", 
    borderRightWidth: 1, 
    borderRightColor: "#0096B4",
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colTotal: { 
    width: "15%", 
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  
  headerText: {
    color: "#0096B4",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "center",
    width: "100%",
  },
  cellText: {
    fontSize: 8,
    color: "#1B2320",
  },

  // Bottom Area: Payments and Totals
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  
  // Payment methods
  paymentContainer: {
    width: "45%",
    borderWidth: 1.5,
    borderColor: "#0096B4",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#FAFDFD",
  },
  paymentHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0096B4",
    borderBottomWidth: 1,
    borderBottomColor: "#E6F4F8",
    paddingBottom: 3,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
    columnGap: 8,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    width: "46%",
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#0096B4",
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: "#0096B4",
  },
  checkboxText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  paymentLabel: {
    fontSize: 8,
    color: "#333",
  },
  
  // Totals Style Boxes
  totalsContainer: {
    width: "50%",
    borderWidth: 1.5,
    borderColor: "#0096B4",
    borderRadius: 4,
    overflow: "hidden",
  },
  totalRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0096B4",
  },
  totalLabel: {
    width: "65%",
    backgroundColor: "#E6F4F8",
    color: "#0096B4",
    fontSize: 8,
    fontWeight: "bold",
    padding: 5,
    borderRightWidth: 1.5,
    borderRightColor: "#0096B4",
  },
  totalValue: {
    width: "35%",
    padding: 5,
    textAlign: "right",
    fontSize: 8.5,
    fontWeight: "bold",
  },
  
  // Signature Box
  signatureContainer: {
    marginTop: 20,
    width: "45%",
  },
  signatureTitle: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#0096B4",
    textAlign: "left",
    textDecoration: "underline",
    marginBottom: 2,
  },
  
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 7,
    color: "#999",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 4,
  }
});

type InvoicePdfProps = {
  merchant: { businessName: string; businessSubtitle?: string | null; address?: string | null; email: string; vatNumber?: string | null; phone?: string | null };
  client: { name: string; address?: string | null; email?: string | null; vatNumber?: string | null; phone?: string | null };
  invoice: {
    number: string;
    type: "QUOTE" | "INVOICE";
    issueDate: Date;
    dueDate?: Date | null;
    subtotal: number;
    vatTotal: number;
    total: number;
    advanceReceived?: number;
    paymentMethod?: string | null;
    notes?: string | null;
  };
  items: { description: string; quantity: number; unitPrice: number; vatRate: number; lineTotal: number }[];
};

export function InvoicePdf({ merchant, client, invoice, items }: InvoicePdfProps) {
  const docLabel = invoice.type === "QUOTE" ? "DEVIS" : "FACTURE";
  
  // Calculations
  const advance = invoice.advanceReceived || 0;
  const remaining = Math.max(0, invoice.total - advance);
  
  // Format dates
  const formattedDate = new Date(invoice.issueDate).toLocaleDateString("fr-FR");
  
  // Payment check states
  const method = invoice.paymentMethod || "";
  const isCash = method === "CASH";
  const isCheck = method === "CHECK";
  const isWave = method === "WAVE";
  const isOrangeMoney = method === "ORANGE_MONEY";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Block (style NBS Electronic) */}
        <View style={styles.headerContainer}>
          <Text style={styles.businessName}>{merchant.businessName.toUpperCase()}</Text>
          <Text style={styles.businessSubtitle}>
            {merchant.businessSubtitle || "Vente tous matériaux Électroménagers & Accessoires Téléphones"}
          </Text>
          <View style={styles.contactRow}>
            {merchant.phone && <Text>Tél: {merchant.phone}</Text>}
            {merchant.address && <Text>Adresse: {merchant.address}</Text>}
            <Text>Email: {merchant.email}</Text>
          </View>
        </View>

        {/* Badge & Date/Number */}
        <View style={styles.metaRow}>
          <View style={styles.dateContainer}>
            <Text style={styles.dottedLabel}>Date:</Text>
            <Text style={styles.dottedValue}>{formattedDate}</Text>
          </View>
          
          <View style={styles.docBadgeContainer}>
            <Text style={styles.docBadgeText}>{docLabel}</Text>
          </View>
          
          <Text style={styles.docNumber}>N° {invoice.number.replace("FAC-", "")}</Text>
        </View>

        {/* Client details with underlines */}
        <View style={styles.clientContainer}>
          <View style={styles.clientFieldRow}>
            <Text style={styles.clientFieldLabel}>Client:</Text>
            <Text style={styles.clientFieldValue}>{client.name}</Text>
          </View>
          
          <View style={styles.clientSubRow}>
            <View style={[styles.clientFieldRow, { flex: 1 }]}>
              <Text style={styles.clientFieldLabel}>Tel Client:</Text>
              <Text style={styles.clientFieldValue}>{client.phone || ""}</Text>
            </View>
            <View style={[styles.clientFieldRow, { flex: 1.5 }]}>
              <Text style={styles.clientFieldLabel}>Adr Client:</Text>
              <Text style={styles.clientFieldValue}>{client.address || ""}</Text>
            </View>
          </View>
        </View>

        {/* Lined Ledger Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colQty}>
              <Text style={styles.headerText}>Quantité</Text>
            </View>
            <View style={styles.colDesc}>
              <Text style={[styles.headerText, { textAlign: "left" }]}>Désignation</Text>
            </View>
            <View style={styles.colPrice}>
              <Text style={[styles.headerText, { textAlign: "right" }]}>P. Unitaire</Text>
            </View>
            <View style={styles.colTotal}>
              <Text style={[styles.headerText, { textAlign: "right" }]}>P. TOTAL</Text>
            </View>
          </View>
          
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colQty}>
                <Text style={styles.cellText}>{String(item.quantity)}</Text>
              </View>
              <View style={styles.colDesc}>
                <Text style={styles.cellText}>{item.description}</Text>
              </View>
              <View style={styles.colPrice}>
                <Text style={styles.cellText}>{formatCFA(Number(item.unitPrice))}</Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={styles.cellText}>{formatCFA(Number(item.lineTotal))}</Text>
              </View>
            </View>
          ))}
          
          {/* Pad with empty rows to look like a physical paper receipt book */}
          {Array.from({ length: Math.max(1, 12 - items.length) }).map((_, idx) => (
            <View key={`empty-${idx}`} style={[styles.tableRow, idx === Math.max(1, 12 - items.length) - 1 ? { borderBottomWidth: 0 } : {}]}>
              <View style={styles.colQty}>
                <Text style={styles.cellText}> </Text>
              </View>
              <View style={styles.colDesc}>
                <Text style={styles.cellText}> </Text>
              </View>
              <View style={styles.colPrice}>
                <Text style={styles.cellText}> </Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={styles.cellText}> </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Section: Payment Methods & Totals */}
        <View style={styles.bottomSection}>
          
          {/* Mode de paiement */}
          <View style={{ flex: 1, flexDirection: "column", gap: 15 }}>
            {invoice.type === "INVOICE" && (
              <View style={styles.paymentContainer}>
                <Text style={styles.paymentHeader}>MODE DE PAIEMENT</Text>
                <View style={styles.paymentGrid}>
                  <View style={styles.paymentOption}>
                    <View style={[styles.checkbox, isCash ? styles.checkboxChecked : {}]}>
                      {isCash && <Text style={styles.checkboxText}>X</Text>}
                    </View>
                    <Text style={styles.paymentLabel}>Espèces</Text>
                  </View>
                  <View style={styles.paymentOption}>
                    <View style={[styles.checkbox, isCheck ? styles.checkboxChecked : {}]}>
                      {isCheck && <Text style={styles.checkboxText}>X</Text>}
                    </View>
                    <Text style={styles.paymentLabel}>Chèque</Text>
                  </View>
                  <View style={styles.paymentOption}>
                    <View style={[styles.checkbox, isWave ? styles.checkboxChecked : {}]}>
                      {isWave && <Text style={styles.checkboxText}>X</Text>}
                    </View>
                    <Text style={styles.paymentLabel}>Wave</Text>
                  </View>
                  <View style={styles.paymentOption}>
                    <View style={[styles.checkbox, isOrangeMoney ? styles.checkboxChecked : {}]}>
                      {isOrangeMoney && <Text style={styles.checkboxText}>X</Text>}
                    </View>
                    <Text style={styles.paymentLabel}>Orange Money</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Signature Box */}
            <View style={styles.signatureContainer}>
              <Text style={styles.signatureTitle}>Le Gérant</Text>
            </View>
          </View>

          {/* Totals Table */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>MONTANT TOTAL DE LA COMMANDE</Text>
              <Text style={styles.totalValue}>{formatCFA(Number(invoice.total))} F</Text>
            </View>
            {invoice.type === "INVOICE" && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>AVANCE REÇUE</Text>
                  <Text style={styles.totalValue}>{formatCFA(advance)} F</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SOLDE RESTANT</Text>
                  <Text style={styles.totalValue}>{formatCFA(remaining)} F</Text>
                </View>
                <View style={[styles.totalRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.totalLabel}>TOTAL A REGLER</Text>
                  <Text style={styles.totalValue}>{formatCFA(remaining)} F</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {invoice.notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.dottedLabel, { color: "#0096B4" }]}>Notes:</Text>
            <Text style={{ fontSize: 8, color: "#555", marginTop: 2 }}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Document généré par {merchant.businessName} — Merci pour votre confiance !
        </Text>
      </Page>
    </Document>
  );
}
