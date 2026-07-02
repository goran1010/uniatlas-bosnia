# UniAtlas Bosnia

An open-source monorepo for Bosnia and Herzegovina higher-education data. It combines a public REST API, an authenticated contribution workflow, and a React frontend for browsing universities and managing data suggestions.

Live frontend: <https://uniatlas-bosnia.netlify.app/>

Live backend REST API: <https://round-leann-goran-jovic-1010-ccad2ae8.koyeb.app/api>

In-app API docs: <https://uniatlas-bosnia.netlify.app/api-docs>

![UniAtlas Bosnia](./frontend/public/images/og-image-home.png)

## Table of contents

- [Project overview](#project-overview)
- [Current features](#current-features)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [API overview](#api-overview)
- [Testing and quality checks](#testing-and-quality-checks)
- [Deployment notes](#deployment-notes)
- [Built with](#built-with)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Project overview

The project models higher-education data as a nested academic hierarchy:

- University
- Faculty
- Study program
- Subject

Public consumers can browse and query that data through unauthenticated endpoints under `/api/v1`. Authenticated users can submit create, update, and delete suggestions for university-related data, and admins can review those suggestions before they are applied.

## Current features

- Public REST API under `/api` and `/api/v1`
- University listing and search by name, city, or acronym
- University detail responses with nested faculties, study programs, and subjects
- Study-program search across all universities
- Email/password signup with email confirmation before account creation
- Session-based login/logout with Passport
- Optional GitHub OAuth login
- Authenticated contribution flow for university data suggestions
- Per-user pending-change listing and deletion
- Admin moderation endpoints for approving or declining pending changes
- CSRF protection for protected auth and user routes
- Netlify proxy support for first-party session cookies in production

## Getting started

### Prerequisites

Install the following locally:

- Node.js 24.x
- npm
- PostgreSQL

Verify the toolchain:

```bash
node --version
npm --version
psql --version
```

You will also need:

- a Resend API key for signup confirmation emails
- GitHub OAuth credentials if you want GitHub login enabled

Create GitHub OAuth credentials at <https://github.com/settings/developers> if you plan to use the GitHub sign-in flow.

### Installation

Clone the repository:

```bash
git clone https://github.com/goran1010/uniatlas-bosnia.git
cd uniatlas-bosnia
```

Install root, backend, and frontend dependencies:

```bash
npm run install:all
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then fill in the backend values and adjust the frontend backend URL if needed.

## Environment variables

### Backend envs

The backend example file lives at `backend/.env.example`.

- `DATABASE_URL`: PostgreSQL connection string for development
- `TEST_DATABASE_URL`: separate PostgreSQL database for backend tests
- `RESEND_API_KEY`: API key for confirmation emails
- `FRONTEND_URL`: frontend origin allowed by credentialed CORS
- `BACKEND_URL`: public backend base URL used in confirmation links
- `PORT`: backend port, usually `3000`
- `COOKIE_SECRET`: session secret
- `NODE_ENV`: runtime mode, usually `development`
- `GITHUB_CLIENT_ID`: optional GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: optional GitHub OAuth client secret
- `GITHUB_CALLBACK_URL`: GitHub OAuth callback URL

Local callback example:

```text
http://localhost:3000/auth/github/callback
```

Production callback example with the Netlify proxy:

```text
https://yoursite.netlify.app/backend/auth/github/callback
```

### Frontend envs

The frontend example file lives at `frontend/.env.example`.

- `VITE_BACKEND_URL`: backend base URL used by the React app

Typical local value:

```text
http://localhost:3000
```

Typical Netlify production value:

```text
/backend
```

## Database setup

Run development migrations and generate the Prisma client:

```bash
npm run db:deploy_generate
```

If you plan to run backend tests locally, initialize the test database too:

```bash
npm run db:test:deploy_generate
```

Seed the databases if needed:

```bash
npm run db:seed
npm run db:test:seed
```

Start both services:

```bash
npm run dev:all
```

Or start them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Local defaults:

- backend: `http://localhost:3000`
- frontend: `http://localhost:5173`

## API overview

### Response shape

Successful responses return `data` and usually a `message`.

```json
{
  "message": "Universities retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "University of Sarajevo",
      "acronym": "UNSA",
      "city": "Sarajevo",
      "entity": "FBIH",
      "ownership": "JAVNA"
    }
  ]
}
```

Errors return an `error.message` payload.

```json
{
  "error": {
    "message": "Validation failed: Search term must have at least 2 characters."
  }
}
```

### Public endpoints

Base URL:

```text
https://round-leann-goran-jovic-1010-ccad2ae8.koyeb.app
```

- `GET /api`
- `GET /api/v1`
- `GET /api/v1/universities`
- `GET /api/v1/universities/search?searchTerm=...`
- `GET /api/v1/universities/:id`
- `GET /api/v1/study-programs/search?searchTerm=...`

### Contribution workflow

Contribution requests are stored as pending changes. Each record captures:

- the entity type: `UNIVERSITY`, `FACULTY`, `STUDY_PROGRAM`, or `SUBJECT`
- the change type: `CREATE`, `UPDATE`, or `DELETE`
- a target ID or parent ID when required
- the proposed JSON payload for admin review

Successful email confirmation currently ends with a rendered confirmation page, while session-based login and logout return JSON responses.

## Testing and quality checks

### Tests

Run all tests:

```bash
npm run test:all
```

Run service-specific suites:

```bash
npm run test:backend
npm run test:frontend
```

Run coverage:

```bash
npm run test:coverage:all
npm run test:coverage:backend
npm run test:coverage:frontend
```

Backend tests require `TEST_DATABASE_URL` to point to a separate PostgreSQL database.

### Quality checks

```bash
npm run lint:all
npm run typecheck:all
npm run format:check:all
```

## Deployment notes

- Backend: any Node.js host that can run Prisma migrations against PostgreSQL
- Frontend: Netlify, using `frontend/netlify.toml` to proxy `/backend/*` to the backend service
- Cookies: the proxy keeps frontend-auth requests first-party in production
- Public API consumers can call the backend directly without the Netlify proxy

## Built with

### Backend

- Express
- Prisma
- PostgreSQL
- PassportJS
- express-session
- csrf-sync
- express-validator
- Helmet
- Pino
- Resend
- Vitest
- Supertest

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- React Helmet Async
- Vitest
- React Testing Library

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines. Code changes, documentation updates, bug reports, and data-quality improvements are all welcome.

## Authors

- Goran Jović - [@goran1010](https://github.com/goran1010)

See also the list of [contributors](https://github.com/goran1010/uniatlas-bosnia/contributors).

## License

This project is licensed under the GNU Affero General Public License v3.0. See [LICENSE.md](./LICENSE.md).

## Acknowledgments

- General university data sourced from [Agencija za razvoj visokog obrazovanja i osiguranje kvaliteta Bosne i Hercegovine (HEA)](https://www.hea.gov.ba/Content/Read/lista-akreditiranih-vsu)
