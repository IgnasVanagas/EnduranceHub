# EnduranceHub Frontend

Single-page application built with React and Vite. The UI targets three roles (athlete, specialist, administrator) and consumes the REST API exposed by the backend service.

## Features
- Authentication and session persistence powered by `AuthContext` (access + refresh tokens, automatic rotation).
- Dashboard with quick shortcuts to athlete profile, training plans, nutrition plans, and inbox.
- CRUD workflows for training and nutrition plans with role-based access (specialist/admin can manage, athletes can view).
- Athlete profile editor with inline validation and role-aware selection.
- Messaging module with inbox/outbox view, message composer, and recipient discovery.
- Shared UI components (layout, loader, navigation) and modular CSS.

## Project Structure
- `src/api` - API helper modules.
- `src/components` - shared layout, navigation, loaders, and cards.
- `src/contexts` - authentication context provider and hooks.
- `src/hooks` - custom hooks (e.g., `useAuth`).
- `src/pages` - routed pages (dashboard, profile, plans, messages, auth).
- `src/styles` - component-level CSS files.

## Getting Started
1. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend base URL (include the `/api` suffix).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the printed URL (default `http://localhost:5173`) in the browser. The app automatically redirects to `/login` when the user is not authenticated.

## Available Scripts
- `npm run dev` - Vite dev server with hot module replacement.
- `npm run build` - production build (outputs to `dist/`).
- `npm run preview` - serves the built assets locally for smoke tests.
- `npm run lint` - ESLint using the project-wide config.

## Backend Integration
- All requests go through `AuthContext` helper `authFetch`, which attaches JWT tokens and handles refresh flow transparently.
- `VITE_API_URL` must match the backend deployment (for example `http://localhost:4000/api` locally or `https://your-backend.onrender.com/api` in the cloud).
- After a successful login the app stores the session in `localStorage` (`endurancehub_auth_v1`) to survive refreshes.

## Building for Production
1. Ensure `VITE_API_URL` points at the production backend.
2. Run `npm run build` to generate static assets in `dist/`.
3. Serve the contents of `dist/` through any static hosting provider (Render static site, Netlify, Vercel, S3 + CloudFront, etc.).
4. When deploying with the provided `render.yaml`, the static site build is handled automatically and the output is published directly by Render.

## Testing Checklist for Defences
- Log in with each role and confirm navigation guards (guest routes redirect to `/login`, authenticated users land on `/`).
- Verify CRUD flows:
  - Create training plan (201), update (200), delete (204).
  - Create nutrition plan and check macronutrient formatting.
  - Update athlete profile and ensure data reloads.
- Trigger validation errors (missing fields) to demonstrate 400 responses.
- Confirm messaging inbox/outbox updates and timestamp formatting.
- Log out to clear stored tokens and revoke refresh token server-side.
