import { EndpointCard } from "./EndPointCard";
import { apiEndpoints, authenticatedGroupsEndpoints } from "./utils/endpoints";
import { use } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Helmet } from "react-helmet-async";
import { BACKEND_URL } from "../../utils/envConfig";

function MethodTag({
  method,
}: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}) {
  const methodClasses = {
    GET: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    POST: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    PATCH:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
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
  const { t } = use(RootContext);

  return (
    <>
      <Helmet>
        <title>{`${t("title.api")} | ${t("title.app")}`}</title>
        <meta name="description" content={t("meta.api")} />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href="https://uniatlas-bosnia.netlify.app/api-docs"
        />
        <meta
          property="og:url"
          content="https://uniatlas-bosnia.netlify.app/api-docs"
        />
        <meta
          property="og:title"
          content={`${t("title.api")} | ${t("title.app")}`}
        />
        <meta property="og:description" content={t("meta.api")} />
        <meta
          name="twitter:title"
          content={`${t("title.api")} | ${t("title.app")}`}
        />
        <meta name="twitter:description" content={t("meta.api")} />
      </Helmet>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col gap-8 py-8 dark:text-gray-100">
        <header>
          <h1 className="text-3xl font-bold mb-3 text-center">
            {t("api.title")}
          </h1>
          <p>{t("api.publicIntro")}</p>
          <pre className="mt-3 bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm font-mono overflow-x-auto">
            {BACKEND_URL}
          </pre>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {t("api.authIntro")}
          </p>
        </header>
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">
            {t("api.dataObject")}
          </h2>
          <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-xs overflow-x-auto">
            {t("api.dataObjectExample")}
          </pre>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">
            {t("api.endpoints")}
          </h2>
          {apiEndpoints.map((ep) => (
            <EndpointCard key={ep.path} endpoint={ep} />
          ))}
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">
            {t("api.authFlowTitle")}
          </h2>
          <p>{t("api.authFlowBody")}</p>
          <div className="grid gap-4">
            {authenticatedGroupsEndpoints.map((group) => (
              <div
                key={group.titleKey}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 p-4"
              >
                <h3 className="text-lg font-semibold mb-3 text-center">
                  {t(group.titleKey)}
                </h3>
                <ul className="space-y-2">
                  {group.endpoints.map((endpoint) => (
                    <li
                      key={`${group.titleKey}-${endpoint.method}-${endpoint.path}`}
                      className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <MethodTag method={endpoint.method} />
                        <code className="text-sm font-mono break-all">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                        {t(endpoint.descriptionKey)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export { Api };
