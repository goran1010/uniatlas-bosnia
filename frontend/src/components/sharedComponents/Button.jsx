import { Spinner } from "../../utils/Spinner";

function Button({
  children,
  className = "",
  type = "button",
  loading = false,
  variant = "primary",
  ...props
}) {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-surface",
    success: "btn-success",
    danger: "btn-danger",
    update: "btn-update",
    warning: "btn-warning",
  };

  const variantClass = variantClasses[variant] || variantClasses.primary;
  const baseClassName =
    "w-full relative inline-flex items-center justify-center rounded-md p-2 text-sm cursor-pointer disabled:cursor-not-allowed transition-all duration-150";

  return (
    <button
      type={type}
      className={`${variantClass} ${baseClassName} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      <div
        className={`h-full w-full flex justify-center items-center absolute`}
      >
        {loading && <Spinner />}
      </div>
      <span className={`${loading ? "invisible" : "visible"}`}>{children}</span>
    </button>
  );
}

export { Button };
