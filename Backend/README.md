# Restaurant Reservation & Capacity Management Backend

NestJS backend with strict modular architecture and in-memory repositories.

## Run

```bash
npm install
npm run build
npm run start
```

Server runs on `http://localhost:3000`.
Swagger docs: `http://localhost:3000/api-docs`

## API Documentation (Swagger)

Swagger is enabled at `GET /api-docs` and generated directly from controllers + DTOs.

- Every endpoint includes `role` header documentation (`diner | manager | staff | super_user`).
- Endpoints with payloads include request body schemas via DTOs.
- Endpoints include response schemas using the standard envelope:
  - list: `{ data: [...] }`
  - item: `{ data: { ... } }`
  - delete: `{ data: { deleted: true } }`

## Smoke Test

```bash
node scripts/smoke-tests.js
```

Use this after `npm run start` to validate core API health quickly.

## Role Header

All protected endpoints require header:

```http
role: diner | manager | staff | super_user
```

## Frontend Integration

Use `http://localhost:3000` as API base URL.

### Diner flows
- `GET /restaurants?city={city}`
- `GET /menu?restaurant_id={restaurantId}`
- `GET /tableslots/availability?restaurant_id={restaurantId}&slot_id={slotId}`
- `POST /reservations`
- `POST /payments`
- `POST /orders`
- `GET /notifications?user_id={userId}`
- `GET /settings/users/{userId}`
- `PATCH /settings/users/{userSettingId}`

### Manager flows
- `POST /restaurants`
- `POST /restaurants/locations`
- `POST /tables`
- `POST /timeslots`
- `POST /menu`

### Staff flows
- `GET /reservations`
- `PATCH /reservations/{id}`
- `POST /checkin`
- `PATCH /orders/{id}`

## Notes
- No external database is used.
- Data is stored only in repositories.
- Services do not access in-memory arrays directly.
