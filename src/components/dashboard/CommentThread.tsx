import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useComments } from "@/hooks/useStore";
import { addComment, type Session } from "@/lib/store";

interface Props {
  complaintId: string;
  session: Session;
}

export const CommentThread = ({ complaintId, session }: Props) => {
  const comments = useComments(complaintId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const msg = draft.trim();
    if (!msg) return;
    setSending(true);
    const result = await addComment({
      complaintId,
      authorId: session.userId,
      authorName: session.name,
      authorRole: session.role,
      message: msg,
    });
    setSending(false);
    if (!result) {
      toast.error("Failed to send message");
      return;
    }
    setDraft("");
  };

  const roleColor = (role: "student" | "teacher" | "admin") =>
    role === "admin"
      ? "bg-indigo-50 border-indigo-200 text-indigo-900"
      : role === "teacher"
        ? "bg-blue-50 border-blue-200 text-blue-900"
        : "bg-emerald-50 border-emerald-200 text-emerald-900";

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold text-navy/80 hover:text-navy py-1"
      >
        <span className="flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          Conversation {comments.length > 0 && <span className="text-gray-500">({comments.length})</span>}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-2">
                  No messages yet. Start the conversation.
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className={`text-xs rounded-md border p-2 ${roleColor(c.authorRole)}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold uppercase tracking-wide text-[10px]">
                        {c.authorRole === "admin" ? "Admin" : `${c.authorName} · ${c.authorRole}`}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-snug">{c.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message..."
                rows={2}
                className="text-xs min-h-[40px]"
              />
              <Button
                size="sm"
                onClick={send}
                disabled={sending || draft.trim().length === 0}
                className="h-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};