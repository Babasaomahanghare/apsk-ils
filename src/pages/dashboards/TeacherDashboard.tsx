import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Send, ClipboardList, MessageSquare, Download, Paperclip, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DashboardShell, StatusBadge, UrgencyBadge } from "@/components/dashboard/DashboardShell";
import { SlaBadge, TicketIdChip } from "@/components/dashboard/SlaBadge";
import { PieChartCard, BarChartCard } from "@/components/dashboard/Charts";
import { CommentThread } from "@/components/dashboard/CommentThread";
import { Pagination, paginate, totalPagesOf } from "@/components/dashboard/Pagination";
import { PhotoAttachments, AttachmentBadge } from "@/components/dashboard/PhotoLightbox";
import { useComplaints } from "@/hooks/useStore";
import {
  addComplaint,
  TEACHER_CATEGORIES,
  wordCount,
  type Session,
  type Urgency,
} from "@/lib/store";
import { generateTicketPdf } from "@/lib/ticketPdf";

interface Props { session: Session }

type Category = keyof typeof TEACHER_CATEGORIES;

export const TeacherDashboard = ({ session }: Props) => {
  const all = useComplaints();
  const mine = useMemo(
    () => all.filter((c) => c.authorId === session.userId),
    [all, session.userId],
  );

  const stats = useMemo(() => {
    const total = mine.length;
    const resolved = mine.filter((c) => c.status === "resolved").length;
    const pending = mine.filter((c) => c.status === "pending").length;
    const rejected = mine.filter((c) => c.status === "rejected").length;
    return { total, resolved, pending, rejected };
  }, [mine]);

  const categoryCounts = useMemo(() => {
    const labels = Object.keys(TEACHER_CATEGORIES);
    const values = labels.map(
      (cat) => mine.filter((c) => c.category === cat).length,
    );
    return { labels, values };
  }, [mine]);

  const [page, setPage] = useState(1);
  const totalPages = totalPagesOf(mine.length);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pagedMine = paginate(mine, page);

  // Form
  const [category, setCategory] = useState<Category | "">("");
  const [subtopic, setSubtopic] = useState("");
  const [desc, setDesc] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [photos, setPhotos] = useState<File[]>([]);
  const descWords = wordCount(desc);

  const MAX_PHOTOS = 4;
  const MAX_BYTES = 5 * 1024 * 1024;
  const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;
    const valid: File[] = [];
    for (const f of picked) {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(`${f.name}: only JPG, PNG or WEBP allowed.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name}: exceeds 5 MB limit.`);
        continue;
      }
      valid.push(f);
    }
    setPhotos((prev) => {
      const next = [...prev, ...valid].slice(0, MAX_PHOTOS);
      if (prev.length + valid.length > MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos per complaint.`);
      }
      return next;
    });
  };
  const removePhoto = (i: number) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!category) return toast.error("Select a category.");
    if (!subtopic) return toast.error("Select a subtopic.");
    if (descWords < 30)
      return toast.error("Description too short", {
        description: `Need at least 30 words (currently ${descWords}).`,
      });
    const complaint = await addComplaint({
      authorId: session.userId,
      authorName: session.name,
      authorRole: "teacher",
      description: desc.trim(),
      urgency,
      category,
      subtopic,
    }, photos);
    if (!complaint) {
      toast.error("Submission failed");
      return;
    }
    setCategory("");
    setSubtopic("");
    setDesc("");
    setUrgency("low");
    setPhotos([]);
    toast.success(`✅ Submitted — ${complaint.ticketId}`, {
      description: "Your PDF receipt is downloading...",
    });
    try {
      await generateTicketPdf(complaint);
    } catch {
      toast.error("PDF download failed");
    }
  };

  return (
    <DashboardShell session={session} gradient="from-emerald-500 to-emerald-700" roleLabel="Teacher">
      {/* Analytics */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">My Issues — Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartCard
              data={[
                { label: `Total (${stats.total})`, value: stats.total, color: "#3b82f6" },
                { label: `Resolved (${stats.resolved})`, value: stats.resolved, color: "#10b981" },
                { label: `Pending (${stats.pending})`, value: stats.pending, color: "#f59e0b" },
                { label: `Rejected (${stats.rejected})`, value: stats.rejected, color: "#ef4444" },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartCard labels={categoryCounts.labels} values={categoryCounts.values} color="#10b981" />
          </CardContent>
        </Card>
      </div>

      {/* Create issue */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" /> Create Structured Issue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-navy">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v as Category);
                  setSubtopic("");
                }}
              >
                <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(TEACHER_CATEGORIES).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-navy">Subtopic</Label>
              <Select value={subtopic} onValueChange={setSubtopic} disabled={!category}>
                <SelectTrigger className="mt-1 h-11"><SelectValue placeholder={category ? "Select subtopic" : "Select category first"} /></SelectTrigger>
                <SelectContent>
                  {category &&
                    TEACHER_CATEGORIES[category as Category].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-navy">Description (min 30 words)</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder="Provide details about the issue..."
              className="mt-1"
            />
            <p className={`text-xs mt-1 ${descWords >= 30 ? "text-emerald-600" : "text-gray-500"}`}>
              {descWords} / 30 words
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
          <div>
            <Label className="text-xs font-semibold text-navy flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" /> Photos (optional)
            </Label>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Up to {MAX_PHOTOS} images, max 5 MB each. JPG, PNG or WEBP.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPickFiles}
              disabled={photos.length >= MAX_PHOTOS}
              className="mt-2 block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50"
            />
            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <div key={`${f.name}-${i}`} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-white">
                      <img
                        src={url}
                        alt={f.name}
                        className="w-full h-full object-cover"
                        onLoad={() => URL.revokeObjectURL(url)}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white rounded-full p-0.5"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Button
            onClick={submit}
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold"
          >
            Submit Issue
          </Button>
        </CardContent>
      </Card>

      {/* Status tracking */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" /> Status Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mine.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No issues submitted yet.</p>
          ) : (
            <>
            <div className="space-y-3">
              {pagedMine.map((c, i) => (
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
                    <AttachmentBadge count={c.attachments?.length ?? 0} />
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
                  <PhotoAttachments urls={c.attachments ?? []} ticketId={c.ticketId} />
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
                  <CommentThread complaintId={c.id} session={session} />
                </motion.div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
};
