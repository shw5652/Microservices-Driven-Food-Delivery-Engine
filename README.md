# Microservices-Driven Food Delivery Engine

A highly decoupled, fault-tolerant backend infrastructure engineered using a **7-service microservices architecture** built with Node.js and Express.js. This platform manages complete food delivery lifecycle operations, utilizing decoupled REST communication channels, stateless distributed authentication, and an optimized PostgreSQL connection pool layer.

## System Architecture

The ecosystem is divided into 7 independent, decoupled microservices. Each service runs in its own isolated environment process and handles distinct business logic boundaries:

### Service Port Mapping & Boundaries

| Service | Port | Primary Responsibility | Data Entities Managed |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `4001` | Token Lifecycle & Authentication | Users, Hashed Credentials |
| **User Service** | `4002` | Profile Management & Logistics Locations | User Profiles, Delivery Addresses |
| **Restaurant Service** | `4003` | Public Marketplace Catalog & Menus | Restaurants, Menu Items |
| **Order Service** | `4004` | Order State Transitions & Lifecycle | Orders, Order History |
| **Cart Service** | `4005` | Volatile Checkout Stage Tracking | Shopping Carts, Cart Items |
| **Payment Service** | `4006` | Transaction Multi-State Processing | Payments, Financial Invoices |
| **Delivery Service** | `4007` | Logistics Driver Handlers & Tracking | Delivery Assignments, Statuses |

---

## Tech Stack

- **Runtime Environment:** Node.js
- **Backend Framework:** Express.js (REST API Architecture)
- **Database Engine:** PostgreSQL (Hosted via Supabase)
- **Security & Identity:** JSON Web Tokens (JWT), Cryptographic `bcrypt`
- **Configuration & Tooling:** Connection Pooling (`pg-pool`), Environment isolation via `dotenv`

---

## Key Architectural Implementations

### 1. Zero-Trust Decentralized Authentication
To prevent the system database from becoming a single point of failure (SPOF) during authorization routing, authentication is handled statelessly:
- **Token Rotation:** The **Auth Service** signs a dual-token payload: a short-lived `accessToken` and a 7-day `refreshToken` mechanic.
- **Independent Middleware Verification:** Individual microservices intercept incoming `Authorization: Bearer <token>` headers, cryptographically validating the payload locally using a shared `JWT_SECRET` key string. This cuts database verification network latency down to 0ms.
- **Credential Protection:** High-entropy user passwords undergo isolated multi-round `bcrypt` computation loops prior to persistent state commits.

### 2. Tuned Database Connection Pooling
The platform leverages a custom configured connection pool engine via the `pg` library driver to manage PostgreSQL transactions efficiently under high concurrent load:
- **Pool Constraints:** Caps maximum warm database channels at 20 (`DB_MAX_CLIENTS`).
- **Timeouts:** Configured with a `30000ms` idle connection prune window and a strict `2000ms` allocation timeout threshold to guarantee sub-second lease responses.
- **Production Encryption:** Enforces native SSL handshakes (`rejectUnauthorized: false`) across remote instances.

### 3. Asynchronous Fault Isolation
Each service runs inside an entirely independent runtime process loop. If a downstream auxiliary tracker (such as the `Delivery Service`) crashes, core marketplace pathways—like account creation, store item searching, and checkout cart management—remain perfectly online, preventing cascading runtime errors across boundaries.

---

## REST API Contract Specifications (Core Subsets)

### Auth Service (`:4001`)
- `POST /api/auth/signup` - Registers a new user validation envelope.
- `POST /api/auth/login` - Authenticates profile credentials; returns JSON Web Tokens.
- `POST /api/auth/currUser` - Retreives active authenticated profile contexts.
- `POST /api/auth/refresh` - Evaluates the 7-day refresh token array to cycle access tokens.
- `POST /api/auth/logout` - Revokes current token baseline.

### User Service (`:4002`)
- `GET /api/user/profile` - Fetches authenticated profile payload *(Requires valid JWT)*.
- `POST /api/user/address/add` - Enforces structural target destination additions.
- `GET /api/user/address/get` - Retrieves address records bound to user context.
- `PUT /api/user/address/update` - Modifies designated location records.
- `DELETE /api/user/address/delete` - Drops specific target address lines.

### Restaurant Service (`:4003`)
- `GET /api/restaurants` - Public query targeting live restaurant entities.
- `GET /api/restaurants/:id` - Focuses individual restaurant asset details.
- `POST /api/restaurants` - Secure pipeline handler to mount new catalog units.
- `GET /api/menu` - Exposes itemized food options.

### Order Service (`:4004`)
- `POST /api/orders/place` - Spawns a transaction model array snapshot.
- `GET /api/orders/get` - Pulls historical tracking context for a profile.
- `PUT /api/orders/:id/status` - Executes multi-state order updates.
- `DELETE /api/orders/delete/:id` - Cancels active order state.

### Payment Service (`:4006`)
- `POST /payments` - Initializes payment gateway intents.
- `POST /payments/:paymentId/confirm` - Commits positive execution changes.
- `POST /payments/:paymentId/fail` - Logs payment failure vectors cleanly.

---

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

### Environment variables

Each service reads environment variables via `dotenv`. Typical variables you should provide (example .env for a service):

PORT=4001
DATABASE_URL=postgres://user:password@localhost:5432/yourdb
JWT_SECRET=your_jwt_secret

Place an appropriate `.env` file inside each service folder (e.g. `backend/auth-service/.env`) when running locally.


### Database

Several services depend on PostgreSQL (`pg` package). Create databases for services that need persistence (users, restaurants, orders, etc.). Migrations/seeding scripts are not included — add them to each service as appropriate.


