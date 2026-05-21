function Label({ children, className = "", ...props }) {
  const baseStyles = "block text-sm font-medium mb-1 text-(--text-secondary)";

  return (
    <label className={`${baseStyles} ${className}`} {...props}>
      {children}
    </label>
  );
}

export { Label };
