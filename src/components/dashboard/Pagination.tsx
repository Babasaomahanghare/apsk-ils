import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: Props) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-2"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-xs font-semibold text-navy bg-white/80 border border-gray-200 rounded-md px-3 py-1.5">
        Page {page} of {totalPages}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-2"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const PAGE_SIZE = 7;

export const paginate = <T,>(items: T[], page: number, pageSize = PAGE_SIZE): T[] => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const totalPagesOf = (count: number, pageSize = PAGE_SIZE): number =>
  Math.max(1, Math.ceil(count / pageSize));