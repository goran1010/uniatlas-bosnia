function Select({ children, className = "", ...props }) {
  const baseClassName =
    "block w-full px-3 py-2 rounded-md cursor-pointer text-sm shadow-sm transition-[border-color,box-shadow] duration-150 bg-(--surface-2) text-(--text-primary) border border-(--border-color) [box-shadow:inset_0_1px_0_rgba(255,255,255,0.28)] focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--focus-ring) disabled:bg-(--surface-3) disabled:text-(--disabled-text) disabled:cursor-not-allowed disabled:opacity-85";

  return (
    <select className={`${baseClassName} ${className}`} {...props}>
      {children}
    </select>
  );
}

export { Select };
