# Cloud Deployment Guide (Render Blueprint)

This guide shows how to deploy EnduranceHub to the Render cloud platform using the provided `render.yaml` blueprint. Any other platform that can run Node.js services and serve static assets will also work, but Render is free-tier friendly and easy to demonstrate.

## Prerequisites

- Render account with access to the free plan.
- External MySQL instance (PlanetScale, Railway, Aiven, AWS RDS, etc.). Collect the host, port, database name, user, and password.
- Git repository containing this project (Render pulls the code directly from Git).
- Node.js 20 and npm are specified in the blueprint; no need to install them manually.

## 1. Provision a MySQL database

1. Create a MySQL database at the provider of your choice.
2. Whitelist Render's outbound IPs if required by the provider.
3. Note the following connection parameters:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DB`

## 2. Import the Render blueprint

1. In the Render dashboard select **New > Blueprint**.
2. Point Render to your Git repository and choose the `main` branch.
3. Render detects `render.yaml` and shows two services:
   - `endurancehub-backend` (Node web service).
   - `endurancehub-frontend` (static site).

## 3. Configure backend environment variables

Edit the pending `endurancehub-backend` service and replace the placeholder values provided in `render.yaml`:

| Key | Description |
|-----|-------------|
| `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DB` | Connection info for the managed MySQL instance. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Generate strong random strings (for example with `openssl rand -hex 32`). |
| `CORS_ORIGIN` | Public URL of the frontend once it is deployed (you can use a placeholder now and adjust after the first deploy). |

Leave `PORT`, `ACCESS_TOKEN_TTL`, and `REFRESH_TOKEN_TTL` unchanged unless you need different token lifetimes. Render sets `PORT` automatically for incoming traffic, so keeping `4000` is safe.

## 4. Configure frontend environment variables

For `endurancehub-frontend` update the placeholder in `VITE_API_URL` to point to the backend:

```
https://<backend-service-name>.onrender.com/api
```

You can deploy the backend first, copy the generated URL from the service dashboard, and then update the frontend environment variable accordingly.

## 5. Deploy

1. Click **Apply** to create the services. The backend will install dependencies and start with `npm run start`.
2. Once the backend is live, verify the health endpoint: `https://<backend-host>/api/health`.
3. Trigger the frontend deploy. It runs `npm install && npm run build` and publishes the `dist` folder as a static site.
4. After both services are live, browse to the frontend URL and confirm that the login screen loads. Swagger UI is available at `https://<backend-host>/api/docs`.

## 6. Seed demo data (optional)

To populate demo users for the defence:

1. Open the backend service in Render.
2. Use the **Shell** tab or run a one-off job with the command:
   ```
   npm run seed
   ```
3. The script recreates tables and inserts the demo accounts listed in `README.md`.

## 7. Keep services in sync

- The blueprint is set to manual deploys (`autoDeploy: false`). Trigger redeploys after pushing changes or enable automatic deploys in the Render dashboard.
- Remember to update `CORS_ORIGIN` if the frontend URL changes, and `VITE_API_URL` if the backend URL changes (e.g., after enabling custom domains).
- For staging environments duplicate the services and use different databases or schema names.

With these steps the project runs fully in the cloud, fulfilling the coursework requirement that the solution is reachable on the web via cloud technologies.
