import { StyleSheet } from "@react-pdf/renderer"

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  meta: {
    textAlign: "right",
    fontSize: 10,
    color: "#555555",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    color: "#777777",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  partyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 10,
    color: "#333333",
  },
  table: {
    marginTop: 8,
    borderTop: "1px solid #dddddd",
    borderBottom: "1px solid #dddddd",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottom: "1px solid #eeeeee",
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
    fontFamily: "Helvetica-Bold",
  },
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totalsBlock: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    gap: 24,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
})
