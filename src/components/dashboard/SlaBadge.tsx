import { useEffect, useState } from "react";
import { slaState, type Complaint } from "@/lib/store";

const fmt = (ms: number) => {
  if (ms <= 0) return "0m";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const SlaBadge = ({ complaint }: { complaint: Complaint }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const state = slaState(complaint, now);
  const remaining = complaint.deadline - now;

  if (state === "done") {
    return (
      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-300">
        SLA CLOSED
      </span>
    );
  }

  const map = {
    ontime: { cls: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: "⏳", label: `On Time · ${fmt(remaining)} left` },
    near: { cls: "bg-amber-100 text-amber-900 border-amber-400", icon: "⚠️", label: `Near Deadline · ${fmt(remaining)} left` },
    overdue: { cls: "bg-red-500 text-white border-red-600 animate-pulse", icon: "🔴", label: `Overdue by ${fmt(-remaining)}` },
  } as const;
  const cfg = map[state];
  return (
    <span
      title={`Deadline: ${new Date(complaint.deadline).toLocaleString()}`}
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${cfg.cls}`}
    >
      <span aria-hidden>{cfg.icon}</span> {cfg.label}
    </span>
  );
};

export const TicketIdChip = ({ ticketId }: { ticketId: string }) => (
  <span className="inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border bg-navy text-white border-navy">
    {ticketId}
  </span>
);
