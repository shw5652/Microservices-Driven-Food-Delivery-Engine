# Microservices-Driven Food Delivery Engine

A learning/example project demonstrating a microservices-based architecture for a food delivery platform. The repository is organized as an npm workspace with multiple backend services (each an independent Express-based service) and a modern frontend built with React + Vite.

> Note: This README was generated from the repository contents — backend services live under `backend/*` and the frontend is in `frontend/`.

## Repository layout

- frontend/                  - React + Vite frontend
- backend/
  - auth-service/            - Authentication service (JWT, users)
  - user-service/            - User profile/service
  - restaurant-service/      - Restaurants and menu management
  - order-service/           - Orders service
  - cart-service/            - Cart management
  - payment-service/         - Payment processing (example)
  - delivery-service/        - Delivery/rider tracking service
- package.json               - Root workspace, dev scripts (concurrently)
- setup-services.bat         - Windows helper to initialize common deps & scripts

## Key technologies

- Node.js (ES modules)
- Express
- npm workspaces
- React + Vite (frontend)
- Tailwind CSS (dev dependency present for frontend)
- PostgreSQL (via `pg` in several services)
- Authentication with JWT
- Common libraries: dotenv, bcrypt, nodemon

## Quick start (development)

This project uses npm workspaces. From the repository root you can run the provided dev script which will start all backend services and the frontend concurrently.

1. Install dependencies at the workspace root:

   npm install

2. Start all services + frontend in development mode:

   npm run dev

This runs a number of workspace scripts defined in the root `package.json` that start each backend service with `nodemon` and the frontend with Vite.

If you prefer to run a single service or the frontend individually, use the per-package scripts. Example (from repo root):

- Start a single backend service in dev mode:

  cd backend/auth-service && npm install && npm run dev

- Start the frontend in dev mode:

  cd frontend && npm install && npm run dev

## Environment variables

Each service reads environment variables via `dotenv`. Typical variables you should provide (example .env for a service):

PORT=4001
DATABASE_URL=postgres://user:password@localhost:5432/yourdb
JWT_SECRET=your_jwt_secret

Place an appropriate `.env` file inside each service folder (e.g. `backend/auth-service/.env`) when running locally.

Note: The `payment-service` contains a `src/server.js` that defaults to PORT 4006 if `PORT` is not set.

## Database

Several services depend on PostgreSQL (`pg` package). Create databases for services that need persistence (users, restaurants, orders, etc.). Migrations/seeding scripts are not included — add them to each service as appropriate.

## Useful scripts (root workspace)

- `npm run dev` — starts all backend services and the frontend concurrently.
- `npm run dev:backend` — starts all backend services concurrently.
- `npm run dev:frontend` — starts the frontend only.

Per-service scripts are available in each `backend/<service>/package.json` (start, dev).

## setup-services.bat

A helper Windows batch script is included at the repository root (`setup-services.bat`). It can initialize `package.json` (if missing), install common dependencies for services, and add a dev script. It assumes you run it from Windows and may need adjustment for your environment.

## Development tips

- Use `nodemon` for automatic reloads during development. Each backend package already has a `dev` script that runs `nodemon src/server.js`.
- Keep service responsibilities small and clearly separated. Use HTTP or a message broker to communicate between services when adding inter-service flows.
- Add API documentation (OpenAPI/Swagger) per service to make integration easier.

## Contributing

Contributions are welcome. Suggested improvements:
- Add readme and docs per service describing endpoints, request/response shapes, and env variables.
- Add database migration and seed scripts.
- Add Docker and docker-compose files to run services and a local Postgres instance together.

When opening pull requests, please include a short description of the change and update this README if the repository structure or startup instructions change.

## License

This repository does not include a license file. Add a LICENSE file to make the intended license explicit.

---

If you'd like, I can:
- Create README snippets for each service with env examples and endpoints (if you want me to inspect each service's source files),
- Add a docker-compose example to run all services locally, or
- Commit this README directly to the repo (I have created it here).