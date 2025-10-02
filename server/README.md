Server (Express + Postgres)
=================================

Setup
-----

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.

2. Install dependencies and run migrations:

```bash
cd server
npm install
# Run the SQL in migrations/create_applications_table.sql against your Postgres database
# Example using psql:
# psql $DATABASE_URL -f migrations/create_applications_table.sql
```

3. Start the server:

```bash
npm run dev
```

API endpoints
-------------
- GET /api/applications
- POST /api/applications
- PUT /api/applications/:id
- DELETE /api/applications/:id
