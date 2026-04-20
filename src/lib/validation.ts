export type FieldErrors = Record<string, string>;

export const validateName = (v: string): string | null => {
  const trimmed = v.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Name is required.";
  const parts = trimmed.split(" ");
  if (parts.length !== 2) return "Name must be exactly 2 words (e.g., Rahul Sharma).";
  if (!parts.every((p) => /^[A-Za-z]{2,}$/.test(p))) return "Name must contain only letters.";
  return null;
};

export const validatePhone = (v: string): string | null => {
  if (!v.trim()) return "Phone number is required.";
  if (!/^[6-9]\d{9}$/.test(v.trim())) return "Phone must be 10 digits starting with 6, 7, 8 or 9.";
  return null;
};

export const validateAdmission = (v: string): string | null => {
  if (!v.trim()) return "Admission number is required.";
  if (!/^\d{5}$/.test(v.trim())) return "Admission number must be exactly 5 digits.";
  return null;
};

export const validateEmail = (v: string): string | null => {
  if (!v.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Enter a valid email address.";
  return null;
};

export const validatePassword = (v: string): string | null => {
  if (!v) return "Password is required.";
  if (v.length < 6) return "Password must be at least 6 characters.";
  return null;
};

export const validateRequired = (v: string, label: string): string | null => {
  if (!v.trim()) return `${label} is required.`;
  return null;
};
