import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Send, Star, MessageSquare, ClipboardList, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DashboardShell, StatusBadge, UrgencyBadge } from "@/components/dashboard/DashboardShell";
import { SlaBadge, TicketIdChip } from "@/components/dashboard/SlaBadge";
import { PieChartCard, LineChartCard, buildLast7Days } from "@/components/dashboard/Charts";
import { useComplaints } from "@/hooks/useStore";
import { addComplaint, addFeedback, wordCount, type Session, type Urgency } from "@/lib/store";
import { generateTicketPdf } from "@/lib/ticketPdf";

interface Props { session: Session }

export const StudentDashboard = ({ session }: Props) => {
  const allComplaints = useComplaints();
  const mine = useMemo(
    () => allComplaints.filter((c) => c.authorId === session.userId),
    [allComplaints, session.userId],
  );

  const stats = useMemo(() => {
    const submitted = mine.length;
    const resolved = mine.filter((c) => c.status === "resolved").length;
    const pending = mine.filter((c) => c.status === "pending").length;
    return { submitted, resolved, pending };
  }, [mine]);

  const trend = useMemo(() => buildLast7Days(mine.map((c) => c.createdAt)), [mine]);

  // Complaint form
  const [desc, setDesc] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const descWords = wordCount(desc);

  const submitComplaint = async () => {
    if (descWords < 50) {
      toast.error("Description too short", { description: `Need at least 50 words (currently ${descWords}).` });
      return;
    }
    const complaint = await addComplaint({
      authorId: session.userId,
      authorName: session.name,
      authorRole: "student",
      description: desc.trim(),
      urgency,
    });
    if (!complaint) {
      toast.error("Submission failed");
      return;
    }
    setDesc("");
    setUrgency("low");
    toast.success(`✅ Submitted — ${complaint.ticketId}`, {
      description: "Your PDF receipt is downloading...",
    });
    try {
      await generateTicketPdf(complaint);
    } catch {
      toast.error("PDF download failed");
    }
  };

  // Feedback
  const [fbText, setFbText] = useState("");
  const [rating, setRating] = useState(0);
  const fbWords = wordCount(fbText);
  const submitFeedback = async () => {
    if (fbWords < 25) {
      toast.error("Feedback too short", { description: `Need at least 25 words (currently ${fbWords}).` });
      return;
    }
    if (rating < 1) {
      toast.error("Please rate the school infrastructure (1–5 stars).");
      return;
    }
    await addFeedback({ authorId: session.userId, authorName: session.name, text: fbText.trim(), rating });
    setFbText("");
    setRating(0);
    toast.success("⭐ Feedback submitted");
  };

  return (
    <DashboardShell session={session} gradient="from-skyblue to-blue-600" roleLabel="Student">
      {/* Analytics */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">My Complaints — Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartCard
              data={[
                { label: `Submitted (${stats.submitted})`, value: stats.submitted, color: "#3b82f6" },
                { label: `Resolved (${stats.resolved})`, value: stats.resolved, color: "#10b981" },
                { label: `Pending (${stats.pending})`, value: stats.pending, color: "#f59e0b" },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Complaints — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartCard labels={trend.labels} values={trend.values} />
          </CardContent>
        </Card>
      </div>

      {/* Submit complaint */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <Send className="w-4 h-4 text-skyblue" /> Submit a Complaint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-navy">Description (min 50 words)</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              placeholder="Describe your issue clearly and in detail..."
              className="mt-1"
            />
            <p className={`text-xs mt-1 ${descWords >= 50 ? "text-emerald-600" : "text-gray-500"}`}>
              {descWords} / 50 words
            </p>
          </div>
          <div>
            <Label className="text-xs font-semibold text-navy">Urgency</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(["low", "medium", "high"] as Urgency[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={`text-xs font-bold py-2 rounded-md border transition-all uppercase tracking-wide ${
                    urgency === u
                      ? u === "high"
                        ? "bg-red-500 text-white border-red-600"
                        : u === "medium"
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-slate-700 text-white border-slate-800"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {u === "high" ? "High (URGENT)" : u}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={submitComplaint}
            className="w-full h-11 bg-gradient-to-r from-skyblue to-blue-600 text-white font-semibold"
          >
            Submit Complaint
          </Button>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Infrastructure Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-navy">Feedback (min 25 words)</Label>
            <Textarea
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
              rows={4}
              placeholder="Share your thoughts on school infrastructure..."
              className="mt-1"
            />
            <p className={`text-xs mt-1 ${fbWords >= 25 ? "text-emerald-600" : "text-gray-500"}`}>
              {fbWords} / 25 words
            </p>
          </div>
          <div>
            <Label className="text-xs font-semibold text-navy">Rating</Label>
            <div className="flex gap-1.5 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={submitFeedback}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
          >
            Submit Feedback
          </Button>
        </CardContent>
      </Card>

      {/* My complaints list */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-skyblue" /> My Complaints
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mine.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">You haven't submitted any complaints yet.</p>
          ) : (
            <div className="space-y-3">
              {mine.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-lg border p-3 ${
                    c.urgency === "high" ? "border-red-300 bg-red-50/40" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <TicketIdChip ticketId={c.ticketId} />
                    <UrgencyBadge urgency={c.urgency} />
                    <StatusBadge status={c.status} />
                    <SlaBadge complaint={c} />
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.description}</p>
                  {c.response && (
                    <div className="mt-2 flex items-start gap-2 text-xs bg-blue-50 border border-blue-200 rounded-md p-2">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-blue-900"><strong>Admin:</strong> {c.response}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => generateTicketPdf(c)}
                    >
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
};
