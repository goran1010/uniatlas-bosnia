import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col items-center gap-10 py-8 dark:text-gray-100">
      <header className="flex flex-col items-center gap-6 w-full">
        <h1 className="text-3xl font-bold">Bosnia Lens</h1>
        <section className="w-full text-left">
          <p>
            A free, open-source project providing structured public data about
            Bosnia and Herzegovina through a REST API and web interface.
          </p>
          <p className="mt-2">
            Currently focused on postal codes, with universities as the next
            planned dataset - making Bosnian public data open, searchable, and
            developer-friendly.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 w-full">
          <section className="text-left">
            <h2 className="text-xl font-bold text-center mb-2">
              Available data
            </h2>
            <ul>
              <li>
                <strong>Postal codes</strong> - browse all or search by code and
                city name
              </li>
            </ul>
            <h2 className="text-xl font-bold text-center mt-4 mb-2">
              Planned data
            </h2>
            <ul>
              <li>Universities and their programs</li>
            </ul>
          </section>

          <section className="text-left">
            <h2 className="text-xl font-bold mb-2">Contributing</h2>
            <p>
              Please read{" "}
              <a href="https://github.com/goran1010/bosnia-lens/blob/main/CONTRIBUTING.md">
                CONTRIBUTING.md
              </a>{" "}
              for details on our code of conduct and the process for submitting
              pull requests.
            </p>
            <p className="mt-2">
              We welcome contributions of data, code improvements,
              documentation, and bug reports.
            </p>
          </section>
        </div>
      </header>

      <section className="flex flex-col items-center gap-4 w-full">
        <h2 className="text-xl font-bold">Get started</h2>
        <div className="grid gap-4 md:grid-cols-2 w-full">
          <Link
            to="/postal-codes"
            className="border rounded-lg p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <h3 className="text-lg font-bold mb-1">Postal Codes</h3>
            <p>Browse all postal codes or search by code and city name.</p>
          </Link>
          <Link
            to="/api-docs"
            className="border rounded-lg p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <h3 className="text-lg font-bold mb-1">REST API</h3>
            <p>
              Integrate Bosnia Lens data into your own app via our public REST
              API. View documentation and available endpoints.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export { Home };
