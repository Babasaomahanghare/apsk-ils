import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  validated?: boolean;
  autoComplete?: string;
}

export const FormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  validated,
  autoComplete,
}: Props) => {
  const showError = !!error;
  const showValid = validated && !error && value.trim().length > 0;

  return (
    <motion.div
      animate={showError ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-1.5"
    >
      <Label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "h-11 pr-10 transition-all focus-visible:ring-2",
            showError && "border-destructive focus-visible:ring-destructive",
            showValid && "border-emerald-500 focus-visible:ring-emerald-500",
          )}
        />
        {showValid && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      {showError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};
