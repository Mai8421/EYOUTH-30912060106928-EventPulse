# EventPulse API

A complete event-management backend built with Node.js, Express, MongoDB/Mongoose, JWT, Socket.io, Jest and Supertest.

## Student

- **Arabic name:** نور وائل محمد
- **English name:** Nour Wael Mohamed
- **Student ID:** EYOUTH-30912060106928
- **Required project name:** EYOUTH-30912060106928-EventPulse

## Features

- MVC structure with User, Event, Category, Registration and Message models
- Secure attendee registration/login and JWT role authorization (`requireAuth`, `requireRole`)
- Admin-only event create/update/delete; public list/show
- Combined category, city, date-range and text filters; pagination and date/popularity sorting
- Atomic capacity enforcement, duplicate prevention, owned cancellation and freed-place handling
- Event-room Socket.io announcements plus persistent message history
- `express-validator` 422 responses and centralized safe errors
- Idempotent database seed, automated tests, Swagger UI and Postman collection
- Vercel serverless entry point and `/health` database status

## Local setup

1. Install Node.js 20+, then run `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long `JWT_SECRET`.
3. Run `npm run seed`, then `npm run dev`.
4. Open `http://localhost:3000/api-docs`.

## Useful endpoints

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Public |
| GET/POST | `/api/events` | Public/Admin |
| GET/PATCH/DELETE | `/api/events/:id` | Public/Admin/Admin |
| POST | `/api/registrations/events/:eventId` | Authenticated |
| GET | `/api/registrations` | Authenticated |
| DELETE | `/api/registrations/:id` | Owner |
| GET/POST | `/api/events/:eventId/messages` | Public/Admin |
| GET | `/health`, `/api-docs` | Public |

Use `Authorization: Bearer TOKEN` for protected routes. Local Socket.io clients authenticate with `auth.token`, emit `join-event` with an event ID, and listen for `announcement`.

For the Vercel deployment, connect Socket.io to the production domain with `path: '/api/socket-io/socket.io'` and `transports: ['websocket']`. Authenticated attendees emit `join-event`; admins emit `broadcast` with `{ eventId, text }`. Every broadcast is saved in MongoDB before the event room receives `announcement`.

## Testing and delivery

Run `npm test`. Before submission, replace example secrets, deploy to Vercel with `MONGODB_URI`, `JWT_SECRET`, and the other environment variables, then run the seed against Atlas. Never commit `.env`.

### Final test evidence

- Jest unit tests cover `AppError` and `asyncHandler` success/failure behavior.
- Supertest integration tests cover event creation, listing, combined filtering, category population, role protection, 422 validation, registration uniqueness, capacity, cancellation and freed-place reuse.
- Final verification: **8 tests passed in 2 suites** and production `/`, `/health`, `/api/events`, and `/api-docs` returned HTTP 200.
