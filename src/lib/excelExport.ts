import * as XLSX from "xlsx";
import type { AppUser, Complaint, StudentUser, TeacherUser } from "./store";

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
    ["ISSUE LOGGING SYSTEM APS KHADKI"],
    [`Generated: ${new Date().toLocaleString()}  •  Total: ${complaints.length}`],
    [],
    header,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Merge title across header columns
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } },
  ];

  // Column widths
  ws["!cols"] = [
    { wch: 18 }, { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 16 },
    { wch: 28 }, { wch: 50 }, { wch: 22 }, { wch: 22 }, { wch: 10 },
    { wch: 12 }, { wch: 22 }, { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Complaints");

  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  XLSX.writeFile(wb, `APSK_ILS_Complaints_Report_${date}.xlsx`);
}
