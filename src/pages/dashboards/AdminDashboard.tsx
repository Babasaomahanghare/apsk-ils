import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ClipboardList, Users as UsersIcon, MessageSquare, Check, X, Clock, FileSpreadsheet, Search, FilterX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DashboardShell, RoleTag, StatusBadge, UrgencyBadge } from "@/components/dashboard/DashboardShell";
import { SlaBadge, TicketIdChip } from "@/components/dashboard/SlaBadge";
import { PieChartCard, BarChartCard } from "@/components/dashboard/Charts";
import { CommentThread } from "@/components/dashboard/CommentThread";
import { useComplaints, useUsers } from "@/hooks/useStore";
import { slaState, updateComplaintStatus, type Session, type StudentUser, type TeacherUser } from "@/lib/store";
import { exportComplaintsXlsx } from "@/lib/excelExport";

interface Props { session: Session }

export const AdminDashboard = ({ session }: Props) => {
  const complaintsRaw = useComplaints();
  const users = useUsers();

  // Sort: pending+urgent first, then by createdAt desc
  const complaints = useMemo(() => {
    const score = (c: typeof complaintsRaw[number]) => {
      let s = 0;
      if (c.status === "pending" && c.urgency === "high") s += 1000;
      else if (c.status === "pending") s += 100;
      if (c.urgency === "high") s += 50;
      else if (c.urgency === "medium") s += 20;
      return s;
    };
    return [...complaintsRaw].sort((a, b) => score(b) - score(a) || b.createdAt - a.createdAt);
  }, [complaintsRaw]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const pending = complaints.filter((c) => c.status === "pending").length;
    const rejected = complaints.filter((c) => c.status === "rejected").length;
    const urgent = complaints.filter((c) => c.urgency === "high").length;
    const normal = total - urgent;
    const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);
    return { total, resolved, pending, rejected, urgent, normal, resolutionRate };
  }, [complaints]);

  const urgentPending = complaints.filter((c) => c.urgency === "high" && c.status === "pending");

  const [alertedOnce, setAlertedOnce] = useState(false);
  useEffect(() => {
    if (!alertedOnce && urgentPending.length > 0) {
      toast.error(`🚨 ${urgentPending.length} URGENT complaint${urgentPending.length > 1 ? "s" : ""} pending`, {
        description: "Review the highlighted items below.",
        duration: 6000,
      });
      setAlertedOnce(true);
    }
  }, [urgentPending.length, alertedOnce]);

  const students = users.filter((u) => u.role === "student") as StudentUser[];
  const teachers = users.filter((u) => u.role === "teacher") as TeacherUser[];

  const [responseDraft, setResponseDraft] = useState<Record<string, string>>({});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved" | "rejected">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher">("all");
  const [slaFilter, setSlaFilter] = useState<"all" | "ontime" | "near" | "overdue" | "done">("all");

  const filteredComplaints = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return complaints.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (urgencyFilter !== "all" && c.urgency !== urgencyFilter) return false;
      if (roleFilter !== "all" && c.authorRole !== roleFilter) return false;
      if (slaFilter !== "all" && slaState(c) !== slaFilter) return false;
      if (q && !c.ticketId.toLowerCase().includes(q) && !c.authorName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [complaints, searchTerm, statusFilter, urgencyFilter, roleFilter, slaFilter]);

  const filtersActive =
    searchTerm !== "" || statusFilter !== "all" || urgencyFilter !== "all" ||
    roleFilter !== "all" || slaFilter !== "all";
  const clearFilters = () => {
    setSearchTerm(""); setStatusFilter("all"); setUrgencyFilter("all");
    setRoleFilter("all"); setSlaFilter("all");
  };

  const act = (id: string, status: "resolved" | "pending" | "rejected") => {
    const response = responseDraft[id]?.trim() || undefined;
    updateComplaintStatus(id, status, response);
    setResponseDraft((d) => ({ ...d, [id]: "" }));
    toast.success(`Marked as ${status}`);
  };

  return (
    <DashboardShell session={session} gradient="from-purple-500 to-indigo-600" roleLabel="Administrator">
      {/* Urgent alert banner */}
      {urgentPending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-red-400 bg-red-50 p-4 shadow-[0_0_24px_rgba(239,68,68,0.35)]"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-red-800">
                {urgentPending.length} URGENT complaint{urgentPending.length > 1 ? "s" : ""} awaiting action
              </p>
              <p className="text-sm text-red-700/80">Scroll down to review and respond.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-navy">Status Overview</CardTitle></CardHeader>
          <CardContent>
            <PieChartCard
              height={200}
              data={[
                { label: `Pending (${stats.pending})`, value: stats.pending, color: "#f59e0b" },
                { label: `Resolved (${stats.resolved})`, value: stats.resolved, color: "#10b981" },
                { label: `Rejected (${stats.rejected})`, value: stats.rejected, color: "#ef4444" },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-navy">Urgent vs Normal</CardTitle></CardHeader>
          <CardContent>
            <PieChartCard
              height={200}
              data={[
                { label: `Urgent (${stats.urgent})`, value: stats.urgent, color: "#ef4444" },
                { label: `Normal (${stats.normal})`, value: stats.normal, color: "#3b82f6" },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-navy">Resolution Rate</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-5xl font-bold text-emerald-600">{stats.resolutionRate}%</div>
            <p className="text-xs text-gray-500 mt-2">{stats.resolved} of {stats.total} resolved</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-0">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-navy">Complaints by Status</CardTitle></CardHeader>
        <CardContent>
          <BarChartCard
            labels={["Pending", "Resolved", "Rejected"]}
            values={[stats.pending, stats.resolved, stats.rejected]}
            color="#6366f1"
            height={220}
          />
        </CardContent>
      </Card>

      {/* All complaints */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base text-navy flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-600" /> All Complaints ({filteredComplaints.length}
              {filtersActive && complaints.length !== filteredComplaints.length && (
                <span className="text-gray-400 font-normal"> / {complaints.length}</span>
              )})
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                if (filteredComplaints.length === 0) {
                  toast.error("No complaints to export.");
                  return;
                }
                exportComplaintsXlsx(filteredComplaints, users);
                toast.success("📊 Excel export downloaded");
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export to Excel
            </Button>
          </div>
          {/* Filters */}
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Ticket ID or name..."
                className="pl-8 h-9 text-sm bg-white"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="h-9 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as typeof urgencyFilter)}>
                <SelectTrigger className="h-9 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All urgencies</SelectItem>
                  <SelectItem value="high">High (Urgent)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
                <SelectTrigger className="h-9 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={slaFilter} onValueChange={(v) => setSlaFilter(v as typeof slaFilter)}>
                <SelectTrigger className="h-9 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SLA</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="near">Near deadline</SelectItem>
                  <SelectItem value="ontime">On time</SelectItem>
                  <SelectItem value="done">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                <FilterX className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No complaints submitted yet.</p>
          ) : filteredComplaints.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No complaints match the current filters.</p>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`rounded-lg border p-3 bg-white ${
                    c.urgency === "high" && c.status === "pending"
                      ? "border-red-400 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <TicketIdChip ticketId={c.ticketId} />
                    <span className="font-semibold text-sm text-navy">{c.authorName}</span>
                    <RoleTag role={c.authorRole} />
                    <UrgencyBadge urgency={c.urgency} />
                    <StatusBadge status={c.status} />
                    <SlaBadge complaint={c} />
                    {c.category && (
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        {c.category} → {c.subtopic}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.description}</p>
                  {c.response && (
                    <div className="mt-2 flex items-start gap-2 text-xs bg-blue-50 border border-blue-200 rounded-md p-2">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-blue-900"><strong>Your response:</strong> {c.response}</span>
                    </div>
                  )}
                  <div className="mt-3 space-y-2">
                    <Input
                      value={responseDraft[c.id] || ""}
                      onChange={(e) => setResponseDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                      placeholder="Optional response message..."
                      className="h-9 text-sm"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" onClick={() => act(c.id, "resolved")} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Check className="w-3.5 h-3.5 mr-1" /> Resolve
                      </Button>
                      <Button size="sm" onClick={() => act(c.id, "pending")} variant="outline" className="h-9">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                      </Button>
                      <Button size="sm" onClick={() => act(c.id, "rejected")} className="h-9 bg-red-600 hover:bg-red-700 text-white">
                        <X className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                  <CommentThread complaintId={c.id} session={session} />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users panel */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-indigo-600" /> Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-5">
          <div>
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
              🟢 Students ({students.length})
            </h3>
            {students.length === 0 ? (
              <p className="text-sm text-gray-500">No students registered.</p>
            ) : (
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s.id} className="border border-gray-200 rounded-md p-2.5 bg-white text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-navy">{s.name}</span>
                      <RoleTag role="student" />
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Adm: <span className="font-mono">{s.admission}</span> · Class {s.studentClass}-{s.section}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
              🔵 Teachers ({teachers.length})
            </h3>
            {teachers.length === 0 ? (
              <p className="text-sm text-gray-500">No teachers registered.</p>
            ) : (
              <div className="space-y-2">
                {teachers.map((t) => (
                  <div key={t.id} className="border border-gray-200 rounded-md p-2.5 bg-white text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-navy">{t.name}</span>
                      <RoleTag role="teacher" />
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">{t.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
};
