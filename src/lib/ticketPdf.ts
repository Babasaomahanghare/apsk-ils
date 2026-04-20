import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { Complaint } from "./store";

export async function generateTicketPdf(c: Complaint) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(15, 23, 42); // navy
  doc.rect(0, 0, W, 90, "F");
  doc.setFillColor(234, 179, 8); // gold accent
  doc.rect(0, 90, W, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ARMY PUBLIC SCHOOL KHADKI", 40, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(186, 230, 253);
  doc.text("Issue Logging System — Ticket Receipt", 40, 62);

  // Ticket ID big
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Ticket ID: ${c.ticketId}`, 40, 130);

  // QR code (right)
  try {
    const qrUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/track?ticket=${encodeURIComponent(c.ticketId)}`;
    const qrData = await QRCode.toDataURL(qrUrl, { margin: 1, width: 160 });
    doc.addImage(qrData, "PNG", W - 140, 110, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Scan to track", W - 130, 222);
  } catch {
    /* ignore qr errors */
  }

  // Body
  let y = 170;
  const line = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.text(label.toUpperCase(), 40, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    const wrapped = doc.splitTextToSize(value, W - 200);
    doc.text(wrapped, 40, y + 16);
    y += 16 + wrapped.length * 14 + 10;
  };

  line("Name", c.authorName);
  line("Role", c.authorRole === "student" ? "Student" : "Teacher");
  if (c.category) line("Category", `${c.category} → ${c.subtopic ?? ""}`);
  line("Urgency", c.urgency === "high" ? "HIGH (URGENT)" : c.urgency.toUpperCase());
  line("Submitted", new Date(c.createdAt).toLocaleString());
  line("Deadline (SLA)", new Date(c.deadline).toLocaleString());
  line("Description", c.description);

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(40, 780, W - 40, 780);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Keep this Ticket ID safe. Use it on the Track Complaint page.", 40, 798);
  doc.text(`Generated ${new Date().toLocaleString()}`, W - 40, 798, { align: "right" });

  doc.save(`${c.ticketId}.pdf`);
}
