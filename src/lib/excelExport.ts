import * as XLSX from "xlsx";
import type { AppUser, Complaint, StudentUser, TeacherUser } from "./store";
import { APSK_LOGO_BASE64 } from "@/assets/apsk-logo-base64";

export function exportComplaintsXlsx(complaints: Complaint[], users: AppUser[]) {
  const userMap = new Map(users.map((u) => [u.id, u] as const));

  const header = [
    "Ticket ID", "Name", "Role", "Class", "Admission Number", "Email / Phone",
    "Complaint", "Category", "Subtopic", "Urgency", "Status",
    "Deadline", "Date Submitted",
  ];

  const rows = complaints.map((c) => {
    const u = userMap.get(c.authorId);
    const isStudent = c.authorRole === "student";
    const su = isStudent ? (u as StudentUser | undefined) : undefined;
    const tu = !isStudent ? (u as TeacherUser | undefined) : undefined;
    const contact = u
      ? `${u.email}${u.phone ? " / " + u.phone : ""}`
      : "";
    return [
      c.ticketId,
      c.authorName,
      isStudent ? "Student" : "Teacher",
      su ? `${su.studentClass}-${su.section}` : "",
      su ? su.admission : "",
      contact,
      c.description,
      c.category ?? "",
      c.subtopic ?? "",
      c.urgency.toUpperCase(),
      c.status.toUpperCase(),
      new Date(c.deadline).toLocaleString(),
      new Date(c.createdAt).toLocaleString(),
    ];
  });

  const aoa: (string | number)[][] = [
    ["", "ISSUE LOGGING SYSTEM — APS KHADKI"],
    [`Generated: ${new Date().toLocaleString()}  •  Total: ${complaints.length}`],
    [],
    header,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Merge title across header columns (skip column A which holds the logo)
  ws["!merges"] = [
    { s: { r: 0, c: 1 }, e: { r: 0, c: header.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } },
  ];

  // Column widths — first col widened slightly to host the logo
  ws["!cols"] = [
    { wch: 14 }, { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 16 },
    { wch: 28 }, { wch: 50 }, { wch: 22 }, { wch: 22 }, { wch: 10 },
    { wch: 12 }, { wch: 22 }, { wch: 22 },
  ];
  // Make row 0 tall enough for the logo
  ws["!rows"] = [{ hpt: 64 }, { hpt: 18 }];

  // Embed the APSK logo in the top-left cell A1 using sheetjs-style image attach.
  // xlsx-js-style/SheetJS CE supports !images for embedded pictures.
  // Strip the data-URI prefix to get the raw base64 payload.
  const b64 = APSK_LOGO_BASE64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  // @ts-expect-error — !images is a community SheetJS extension; safe to attach,
  // viewers that don't support it will simply ignore the image.
  ws["!images"] = [
    {
      name: "apsk-logo.jpeg",
      data: b64,
      opts: { base64: true },
      position: {
        type: "twoCellAnchor",
        attrs: { editAs: "oneCell" },
        from: { col: 0, row: 0, colOff: 50000, rowOff: 50000 },
        to:   { col: 1, row: 1, colOff: 0,     rowOff: 0     },
      },
    },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Complaints");

  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  XLSX.writeFile(wb, `APSK_ILS_Complaints_Report_${date}.xlsx`);
}
