import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

function Label({ children, className = "", ...props }: LabelProps) {
  const baseStyles = "block text-sm font-medium mb-1 text-(--text-secondary)";

  return (
    <label className={`${baseStyles} ${className}`} {...props}>
      {children}
    </label>
  );
}

export { Label };
