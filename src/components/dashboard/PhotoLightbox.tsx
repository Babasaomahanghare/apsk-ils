import { useState } from "react";
import { Paperclip } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  urls: string[];
  ticketId?: string;
}

/** Renders a thumbnail row of complaint photos. Click any thumb to open full-size. */
export const PhotoAttachments = ({ urls, ticketId }: Props) => {
  const [active, setActive] = useState<string | null>(null);
  if (!urls || urls.length === 0) return null;
  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <button
            key={u}
            type="button"
            onClick={() => setActive(u)}
            className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-white hover:ring-2 hover:ring-indigo-400 transition"
            aria-label={`Open photo ${i + 1}`}
          >
            <img
              src={u}
              alt={`${ticketId ?? "Complaint"} photo ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl p-2 bg-black/90 border-0">
          {active && (
            <img
              src={active}
              alt="Complaint attachment"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

/** Small chip showing attachment count, e.g. for the card header. */
export const AttachmentBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
      <Paperclip className="w-3 h-3" /> {count}
    </span>
  );
};