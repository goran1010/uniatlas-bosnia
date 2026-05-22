import { forwardRef } from "react";

const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  const baseStyles =
    "block w-full px-3 py-2 rounded-md shadow-sm bg-(--surface-2) text-(--text-primary) border border-(--border-color) [box-shadow:inset_0_1px_0_rgba(255,255,255,0.28)] placeholder:text-(--text-secondary) transition duration-150 focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:bg-(--surface-3) disabled:text-(--disabled-text) disabled:cursor-not-allowed disabled:opacity-85 " +
    "sm:text-sm invalid:border-red-500 focus:invalid:ring-red-500 focus:invalid:border-red-500 " +
    "dark:invalid:border-red-500 dark:focus:invalid:ring-red-500 dark:focus:invalid:border-red-500";

  return (
    <input ref={ref} className={`${baseStyles} ${className}`} {...props} />
  );
});

export { Input };
