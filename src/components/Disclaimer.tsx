import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "apsk-ils-disclaimer-dismissed";

export const Disclaimer = () => {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setOpen(true);
  }, []);

  const handleAccept = () => {
    if (dontShow) localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {}}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-white/20 overflow-hidden"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
          >
            <div className="bg-gradient-to-br from-navy to-skyblue px-6 py-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-1 ring-white/30">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 id="disclaimer-title" className="text-white font-bold text-lg leading-tight">
                  Official Notice
                </h2>
                <p className="text-white/80 text-xs">APSK Issue Logging System</p>
              </div>
            </div>
            <div className="px-6 py-6 space-y-5">
              <p className="text-navy/90 leading-relaxed text-[15px]">
                This platform is the official <span className="font-semibold">Issue Logging System (ILS)</span> of
                Army Public School Khadki. It is intended strictly for authorized students, teachers, and
                administrative staff. Unauthorized access, misuse, or data manipulation is prohibited and may
                lead to disciplinary action.
              </p>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <Checkbox
                  checked={dontShow}
                  onCheckedChange={(v) => setDontShow(Boolean(v))}
                  id="dont-show"
                />
                <span>Do not show this again</span>
              </label>

              <Button
                onClick={handleAccept}
                className="w-full bg-gradient-to-r from-navy to-skyblue hover:from-skyblue hover:to-navy text-white font-semibold h-11"
              >
                I Understand & Accept
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
