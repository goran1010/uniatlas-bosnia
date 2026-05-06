function Select({ children, className = "", ...props }) {
  const baseClassName =
    "control-input block w-full px-3 py-2 rounded-md cursor-pointer focus:ring-2 text-sm shadow-sm transition-all duration-140";

  return (
    <select className={`${baseClassName} ${className}`} {...props}>
      {children}
    </select>
  );
}

export { Select };
