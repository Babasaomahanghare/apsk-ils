import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Complaint } from "./store";

const fmtMs = (ms: number) => {
  if (ms <= 0) return "0m";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

/** Generates the SLA / Complaint summary PDF report (Super Admin only). */
export async function generateSlaReportPdf(complaints: Complaint[], scopeLabel: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 70, "F");
  doc.setFillColor(234, 179, 8);
  doc.rect(0, 70, W, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("APSK ILS — SLA & Complaints Report", 30, 32);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(186, 230, 253);
  doc.text(`Scope: ${scopeLabel}   •   Generated: ${new Date().toLocaleString()}   •   Rows: ${complaints.length}`, 30, 54);

  // Summary stats
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const breached = complaints.filter((c) => {
    const ref = c.resolvedAt ?? Date.now();
    return ref > c.deadline;
  }).length;
  const met = total - breached;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    `Total: ${total}   •   Resolved: ${resolved}   •   SLA Met: ${met}   •   SLA Breached: ${breached}`,
    30,
    96,
  );

  // Table
  autoTable(doc, {
    startY: 110,
    head: [[
      "Ticket ID", "Submitted by", "Role", "Department", "Category",
      "Urgency", "Status", "SLA", "Resolution Time", "Handled By",
    ]],
    body: complaints.map((c) => {
      const ref = c.resolvedAt ?? Date.now();
      const slaMet = ref <= c.deadline;
      const resTime = c.resolvedAt ? fmtMs(c.resolvedAt - c.createdAt) : "—";
      return [
        c.ticketId,
        c.authorName,
        c.authorRole,
        c.assignedTo.replace("_", " "),
        `${c.category ?? ""}${c.subtopic ? " / " + c.subtopic : ""}`,
        c.urgency.toUpperCase(),
        c.status.toUpperCase(),
        slaMet ? "MET" : "BREACHED",
        resTime,
        c.handledBy ?? "—",
      ];
    }),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 7) {
        const v = String(d.cell.raw);
        if (v === "BREACHED") {
          d.cell.styles.textColor = [220, 38, 38];
          d.cell.styles.fontStyle = "bold";
        } else if (v === "MET") {
          d.cell.styles.textColor = [16, 185, 129];
          d.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  doc.save(`APSK_ILS_SLA_Report_${date}.pdf`);
}
