import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import campusHero from "@/assets/campus-hero.jpg";
import { findComplaintByTicket, type Complaint } from "@/lib/store";
import { StatusBadge, UrgencyBadge } from "@/components/dashboard/DashboardShell";
import { SlaBadge, TicketIdChip } from "@/components/dashboard/SlaBadge";

const TrackComplaint = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("ticket") ?? "";
  const [query, setQuery] = useState(initial);
  const [submitted, setSubmitted] = useState(initial);
  const [result, setResult] = useState<Complaint | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) setSubmitted(initial);
  }, [initial]);

  useEffect(() => {
    if (!submitted) { setResult(undefined); return; }
    setLoading(true);
    findComplaintByTicket(submitted).then((r) => {
      setResult(r);
      setLoading(false);
    });
  }, [submitted]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query.trim());
    setParams(query.trim() ? { ticket: query.trim() } : {});
  };

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-center bg-cover" style={{ backgroundImage: `url(${campusHero})` }} aria-hidden />
      <div className="fixed inset-0 -z-10 backdrop-blur-md bg-black/65" aria-hidden />

      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/15">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-gold transition">
            <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-semibold">Home</span>
          </Link>
          <p className="text-white text-sm font-bold">Track Your Complaint</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <Ticket className="w-5 h-5 text-skyblue" /> Enter your Ticket ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="TKT-APS-2026-0001"
                  className="font-mono uppercase"
                />
                <Button type="submit" className="bg-gradient-to-r from-skyblue to-blue-600 text-white">
                  <Search className="w-4 h-4 mr-1" /> Track
                </Button>
              </form>

              {submitted && !result && (
                <p className="mt-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                  No complaint found for <span className="font-mono">{submitted}</span>. Check the Ticket ID and try again.
                </p>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <TicketIdChip ticketId={result.ticketId} />
                    <UrgencyBadge urgency={result.urgency} />
                    <StatusBadge status={result.status} />
                    <SlaBadge complaint={result} />
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-500 text-xs uppercase font-bold">Submitted by</p>
                    <p className="text-navy font-semibold">{result.authorName} ({result.authorRole})</p>
                  </div>

                  {result.category && (
                    <div className="text-sm">
                      <p className="text-gray-500 text-xs uppercase font-bold">Category</p>
                      <p className="text-navy">{result.category} → {result.subtopic}</p>
                    </div>
                  )}

                  <div className="text-sm">
                    <p className="text-gray-500 text-xs uppercase font-bold">Description</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{result.description}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-2">Timeline</p>
                    <ol className="relative border-l-2 border-skyblue/40 pl-4 space-y-3">
                      <li>
                        <div className="absolute -left-[7px] w-3 h-3 rounded-full bg-skyblue" />
                        <p className="text-sm font-semibold text-navy">Submitted</p>
                        <p className="text-xs text-gray-500">{new Date(result.createdAt).toLocaleString()}</p>
                      </li>
                      <li>
                        <div className="absolute -left-[7px] w-3 h-3 rounded-full bg-amber-400" />
                        <p className="text-sm font-semibold text-navy">SLA Deadline</p>
                        <p className="text-xs text-gray-500">{new Date(result.deadline).toLocaleString()}</p>
                      </li>
                      {result.updatedAt !== result.createdAt && (
                        <li>
                          <div className={`absolute -left-[7px] w-3 h-3 rounded-full ${
                            result.status === "resolved" ? "bg-emerald-500" :
                            result.status === "rejected" ? "bg-red-500" : "bg-yellow-400"
                          }`} />
                          <p className="text-sm font-semibold text-navy capitalize">Status: {result.status}</p>
                          <p className="text-xs text-gray-500">{new Date(result.updatedAt).toLocaleString()}</p>
                        </li>
                      )}
                    </ol>
                  </div>

                  {result.response && (
                    <div className="text-sm bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-blue-900 font-semibold text-xs uppercase mb-1">Admin Response</p>
                      <p className="text-blue-900">{result.response}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default TrackComplaint;
