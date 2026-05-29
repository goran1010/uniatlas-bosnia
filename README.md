# Bosnia Lens

A free, open-source project providing structured public data about Bosnia and Herzegovina through a REST API and a React web interface. The focus is universities and academic programs - browse institutions, faculties, study programs, and subjects.

LIVE Web app - <https://bosnia-lens.netlify.app/>

REST API - <https://round-leann-goran-jovic-1010-ccad2ae8.koyeb.app/api>

For more info on how to connect your app to the REST API, visit <https://bosnia-lens.netlify.app/api-docs>

![Bosnia Lens](./frontend/public/og-image.png)

## Table of Contents

- [Features](#features)
- [Data Coverage](#data-coverage)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Authenticated Data Contribution Flow](#authenticated-data-contribution-flow)
- [Running the Tests](#running-the-tests)
- [Deployment](#deployment)
- [Built With](#built-with)
- [Current Status](#current-status)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Versioned REST API**: Public endpoints under `/api/v1`
- **University Search**: Browse all universities or search by name, city, or acronym; retrieve full detail with faculties, study programs, and subjects
- **Study Program Search**: Search study programs by name across all universities
- **Session Authentication**: Passport-based auth with email/password signup, login, logout, and email confirmation
- **GitHub Login**: Optional OAuth2 authentication with GitHub
- **Suggestion-based Data Workflow**: Any authenticated user can suggest university data changes - admins review and approve or reject them
- **CSRF Protection**: Synchronised CSRF tokens required for all mutating requests to authenticated routes
- **First-party cookies**: Frontend proxies authenticated requests through Netlify (`/backend/*`) so session cookies are always same-site

## Data Coverage

- Universities (implemented) — 4-level hierarchy: University → Faculty → Study Program → Subject

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Before running this project, you need to have the following installed:

- Node.js 24.x
- PostgreSQL database server
- npm package manager

```bash
node --version
npm --version
psql --version
```

You will also need:

- A Resend API key for email confirmations (<https://resend.com/>)
- GitHub OAuth credentials if you want GitHub login support (optional):
  - Visit <https://github.com/settings/developers> to create an OAuth app
  - Create a Client ID and Client Secret for your environment

### Installing

A step by step series of examples that tell you how to get a development environment running.

Clone the repository:

```bash
git clone https://github.com/goran1010/bosnia-lens.git
cd bosnia-lens
```

Install all dependencies for both backend and frontend:

```bash
npm run install:all
```

Set up environment variables:

The repository includes example environment files for both services. Copy them and fill in real values before running the app:

Backend: copy `backend/.env.example` to `backend/.env` and edit the values.

```bash
cp backend/.env.example backend/.env
# edit backend/.env
```

Backend env layout:

- `DATABASE_URL`: development PostgreSQL connection string
- `TEST_DATABASE_URL`: separate PostgreSQL database used by tests and test migrations
- `RESEND_API_KEY`: Resend API key for email confirmation
- `FRONTEND_URL`: frontend origin allowed by CORS, usually `http://localhost:5173`
- `BACKEND_URL`: backend's own publicly reachable URL, used for building email confirmation links, usually `http://localhost:3000`
- `PORT`: backend port, usually `3000`
- `COOKIE_SECRET`: session/cookie signing secret
- `NODE_ENV`: app mode, usually `development`
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID (optional, for GitHub login)
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret (optional, for GitHub login)
- `GITHUB_CALLBACK_URL`: GitHub OAuth callback URL - locally `http://localhost:3000/auth/github/callback`, in production `https://yoursite.netlify.app/backend/auth/github/callback`

Frontend: copy `frontend/.env.example` to `frontend/.env` and update `VITE_BACKEND_URL` if needed.

```bash
cp frontend/.env.example frontend/.env
# edit frontend/.env (optional)
```

Frontend env layout:

- `VITE_BACKEND_URL`: backend base URL, usually `http://localhost:3000` for local development. In production on Netlify, set this to `/backend` - the proxy rule in `netlify.toml` forwards those requests to the actual backend, keeping session cookies first-party.

Initialize the development database and generate the Prisma client:

```bash
npm run db:deploy_generate
```

Initialize the test database as well if you plan to run backend tests locally:

```bash
npm run db:test:deploy_generate
```

Seed the databases if needed:

```bash
npm run db:seed

# Seed test database
npm run db:test:seed
```

Start the development servers:

```bash
# Run frontend and backend together
npm run dev:all

# Or run them separately
npm run dev:backend
npm run dev:frontend
```

You should now be able to access the API at `http://localhost:3000` and the web interface at `http://localhost:5173`.

## Available Scripts

Run these from the repository root.

### Installation

- `npm run install:all`: install root, backend, and frontend dependencies

### Database

- `npm run db:deploy_generate`: apply development migrations and generate Prisma client
- `npm run db:generate`: generate Prisma client only
- `npm run db:seed`: seed the development database
- `npm run db:test:deploy_generate`: create/apply migrations for the test database and generate Prisma client in test mode
- `npm run db:test:seed`: seed the test database
- `npm run prisma_studio`: open Prisma Studio from the backend directory

### Development

- `npm run dev:all`: run backend and frontend together
- `npm run dev:backend`: run the Express backend with file watching
- `npm run dev:frontend`: run the Vite frontend dev server

### Testing

- `npm run test:all`: run backend and frontend tests together
- `npm run test:backend`: run backend tests
- `npm run test:frontend`: run frontend tests
- `npm run test:coverage:all`: run coverage for both apps
- `npm run test:coverage:backend`: backend coverage only
- `npm run test:coverage:frontend`: frontend coverage only

### Maintenance

- `npm run remove_merged`: delete local branches already merged into `main` or `master`

## API Overview

### Response format

All JSON API responses follow a consistent structure:

- Success responses use `data` and include an optional `message`.
- Error responses use a nested `error.message`.

Success example:

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

Error example:

```json
{
  "error": {
    "message": "Validation failed: Search term must have at least 2 characters."
  }
}
```

### Public endpoints (no authentication required)

All public endpoints are available under `https://round-leann-goran-jovic-1010-ccad2ae8.koyeb.app/api`

#### Status endpoints

- `GET /api` - Check API status
- `GET /api/v1` - Check API v1 status

#### University endpoints

- `GET /api/v1/universities` - Get all universities (ordered by name)
- `GET /api/v1/universities/search?searchTerm=...` - Search universities by name, city, or acronym (minimum 2 characters)
- `GET /api/v1/universities/:id` - Get a university by ID with full nested detail (faculties, study programs, subjects)

#### Study Program endpoints

- `GET /api/v1/study-programs/search?searchTerm=...` - Search study programs by name across all universities (minimum 2 characters)

**Search parameter:**

- `searchTerm` (required, string): A search string of at least 2 characters

**University object structure:**

```json
{
  "id": 1,
  "name": "University of Sarajevo",
  "acronym": "UNSA",
  "city": "Sarajevo",
  "entity": "FBIH" | "RS" | "BD",
  "ownership": "JAVNA" | "PRIVATNA",
  "foundedYear": 1949,
  "website": "https://www.unsa.ba",
  "faculties": [ ... ]
}
```

## Authenticated Data Contribution Flow

These endpoints require an authenticated session (`credentials: include`) and are protected by CSRF for mutating requests.

### CSRF token endpoint

- `GET /csrf-token` - Issue a CSRF token used in `x-csrf-token` for mutating requests

### Auth endpoints

- `POST /auth/signup` - Register a pending account and send a confirmation email
- `GET /auth/confirm/:token` - Confirm signup token and create the user account
- `POST /auth/login` - Log in with email/password
- `GET /auth/github` - Start GitHub OAuth login flow
- `GET /auth/github/callback` - Complete GitHub OAuth login flow

### User endpoints (authenticated)

- `GET /users/me` - Get current user profile
- `POST /users/logout` - End session

### Contribution endpoints (authenticated users)

- `POST /users/contribution/universities` - Suggest a new university entity (stored as pending change)
- `PUT /users/contribution/universities` - Suggest an edit to a university entity (stored as pending change)
- `DELETE /users/contribution/universities` - Suggest deletion of a university entity (stored as pending change)
- `GET /users/contribution/pending-changes/universities` - List your own pending suggestions
- `DELETE /users/contribution/pending-changes/universities` - Remove one of your own pending suggestions

### Admin endpoints (authenticated admin users)

- `GET /users/admin/pending-changes` - List all pending suggestions
- `POST /users/admin/approve-pending-change` - Approve a pending suggestion and apply it to the live dataset
- `DELETE /users/admin/decline-pending-change` - Reject a pending suggestion

## Running the tests

Backend tests use Vitest and Supertest. Frontend tests use Vitest, React Testing Library, and JSDOM.

### Run all tests

```bash
npm run test:all
```

### Run individual test suites

```bash
npm run test:backend
npm run test:frontend
```

### Run coverage

```bash
npm run test:coverage:all
npm run test:coverage:backend
npm run test:coverage:frontend
```

The backend test suite expects `TEST_DATABASE_URL` to point to a separate PostgreSQL database.

## Deployment

The project is designed to be deployed with:

- **Backend**: Any Node.js hosting service capable of running Express and PostgreSQL-backed Prisma migrations. The backend `build` script runs `prisma generate` and `prisma migrate deploy` automatically.
- **Frontend**: Netlify (recommended). The `netlify.toml` proxy rule forwards `/backend/*` requests to the actual backend so session cookies remain first-party. Set `VITE_BACKEND_URL=/backend` in Netlify's environment variables.
- **Database**: PostgreSQL (Supabase, Koyeb, or self-hosted)

The public REST API (`/api/v1/...`) is served directly from the backend with open CORS and requires no authentication, so third-party apps can call the Koyeb URL directly without going through the Netlify proxy.

## Built With

### Backend

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [Express Validator](https://express-validator.github.io/)
- [Passport](https://www.passportjs.org/) & [Express Session](https://github.com/expressjs/session)
- [Helmet](https://helmetjs.github.io/)
- [Pino](https://getpino.io/)
- [Resend](https://resend.com/)
- [Vitest](https://vitest.dev/) & [Supertest](https://github.com/ladjs/supertest)

### Frontend

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/react)

## Current Status

The project is focused on universities and academic programs. The public API and contribution workflow cover the full 4-level university hierarchy: University → Faculty → Study Program → Subject. Data changes are handled through a pending-suggestion workflow where authenticated users submit proposals and admins moderate them.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests. Contributions of data, code improvements, documentation, and bug reports are all welcomed.

## Authors

- **Goran Jović** - _Initial work_ - [@goran1010](https://github.com/goran1010)

See also the list of [contributors](https://github.com/goran1010/bosnia-lens/contributors) who participated in this project.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE.md](LICENSE.md) file for details. All data used will be public domain or properly attributed to its original source.

## Acknowledgments

- General university data sourced from [Agencija za razvoj visokog obrazovanja i osiguranje kvaliteta Bosne i Hercegovine (HEA)](https://www.hea.gov.ba/Content/Read/lista-akreditiranih-vsu).
