import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1B2320" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  businessName: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  small: { fontSize: 9, color: "#555" },
  docTitle: { fontSize: 22, fontWeight: 700, textAlign: "right", color: "#2F6F4E" },
  section: { marginBottom: 20 },
  label: { fontSize: 9, color: "#888", marginBottom: 2 },
  table: { marginTop: 10 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F7F5F0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  colDesc: { width: "40%" },
  colQty: { width: "15%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colVat: { width: "10%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  totals: { marginTop: 20, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 4 },
  grandTotal: { fontSize: 13, fontWeight: 700, color: "#2F6F4E" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#999", textAlign: "center" },
});

type InvoicePdfProps = {
  merchant: { businessName: string; address?: string | null; email: string; vatNumber?: string | null };
  client: { name: string; address?: string | null; email?: string | null; vatNumber?: string | null };
  invoice: {
    number: string;
    type: "QUOTE" | "INVOICE";
    issueDate: Date;
    dueDate?: Date | null;
    subtotal: number;
    vatTotal: number;
    total: number;
    notes?: string | null;
  };
  items: { description: string; quantity: number; unitPrice: number; vatRate: number; lineTotal: number }[];
};

export function InvoicePdf({ merchant, client, invoice, items }: InvoicePdfProps) {
  const docLabel = invoice.type === "QUOTE" ? "DEVIS" : "FACTURE";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{merchant.businessName}</Text>
            {merchant.address && <Text style={styles.small}>{merchant.address}</Text>}
            <Text style={styles.small}>{merchant.email}</Text>
            {merchant.vatNumber && <Text style={styles.small}>TVA : {merchant.vatNumber}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>{docLabel}</Text>
            <Text style={[styles.small, { textAlign: "right", marginTop: 4 }]}>{invoice.number}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          <View style={styles.section}>
            <Text style={styles.label}>Facturé à</Text>
            <Text>{client.name}</Text>
            {client.address && <Text style={styles.small}>{client.address}</Text>}
            {client.email && <Text style={styles.small}>{client.email}</Text>}
            {client.vatNumber && <Text style={styles.small}>TVA : {client.vatNumber}</Text>}
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Date d'émission</Text>
            <Text>{invoice.issueDate.toLocaleDateString("fr-FR")}</Text>
            {invoice.dueDate && (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>Échéance</Text>
                <Text>{invoice.dueDate.toLocaleDateString("fr-FR")}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colPrice}>Prix HT</Text>
            <Text style={styles.colVat}>TVA</Text>
            <Text style={styles.colTotal}>Total TTC</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.unitPrice.toFixed(2)} €</Text>
              <Text style={styles.colVat}>{item.vatRate}%</Text>
              <Text style={styles.colTotal}>{item.lineTotal.toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Sous-total HT</Text>
            <Text>{invoice.subtotal.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA</Text>
            <Text>{invoice.vatTotal.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotal}>Total TTC</Text>
            <Text style={styles.grandTotal}>{invoice.total.toFixed(2)} €</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.small}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {merchant.businessName} — Document généré automatiquement, faisant foi entre les parties.
        </Text>
      </Page>
    </Document>
  );
}
