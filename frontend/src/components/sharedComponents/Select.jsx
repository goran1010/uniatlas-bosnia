function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`flex-1 cursor-pointer appearance-none whitespace-normal text-center break-all h-full sm:min-w-33 w-full sm:w-auto relative flex items-center 
          justify-center rounded-md text-sm font-semibold bg-(--surface-1) text-(--text-primary) border border-(--border-color) shadow-(--card-shadow-soft) 
          hover:shadow-(--card-shadow) color-(--text-primary) py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)
          open:rounded-b-none max-w-45 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
