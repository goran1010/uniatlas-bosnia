const { VITE_BACKEND_URL } = import.meta.env;

if (typeof VITE_BACKEND_URL !== "string") {
  throw new Error("VITE_BACKEND_URL is not defined in environment variables");
}

export const BACKEND_URL = VITE_BACKEND_URL;
