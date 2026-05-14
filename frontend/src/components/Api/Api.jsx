import { EndpointCard } from "./EndPointCard";
import { endpoints, authenticatedGroups } from "./utils/endpoints";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function MethodTag({ method }) {
  const methodClasses = {
    GET: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    POST: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    DELETE: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${
        methodClasses[method] ||
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
      }`}
    >
      {method}
    </span>
  );
}

function Api() {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col gap-8 py-8 dark:text-gray-100">
      <header>
        <h1 className="text-3xl font-bold mb-3">REST API</h1>
        <p>
          Public REST endpoints are available under the base URL below. These
          endpoints do not require authentication.
        </p>
        <pre className="mt-3 bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm font-mono overflow-x-auto">
          {BASE_URL}
        </pre>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Authenticated endpoints are separate from the public base URL and use
          session cookies plus CSRF tokens for write operations.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Postal code object</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-xs overflow-x-auto">{`{
  "id":   string   — unique identifier
  "code": number   — 5-digit postal code
  "city": string   — city name
  "post": "BH_POSTA" | "POSTE_SRP" | "HP_MOSTAR" | null
}`}</pre>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Endpoints</h2>
        {endpoints.map((ep) => (
          <EndpointCard key={ep.path} endpoint={ep} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">
          Authenticated Data Contribution Flow
        </h2>
        <p>
          These endpoints require an authenticated session (
          <code>credentials: include</code>) and use CSRF protection for
          mutating requests.
        </p>
        <div className="grid gap-4">
          {authenticatedGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 p-4"
            >
              <h3 className="text-lg font-semibold mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.endpoints.map((endpoint) => (
                  <li
                    key={`${group.title}-${endpoint.method}-${endpoint.path}`}
                    className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <MethodTag method={endpoint.method} />
                      <code className="text-sm font-mono break-all">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {endpoint.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { Api };
