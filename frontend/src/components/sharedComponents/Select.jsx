function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`bg-(--surface-1) color-(--text-primary) border border-(--border-color) p-2 rounded ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
