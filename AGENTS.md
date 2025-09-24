# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript app (`components/`, `pages/`, `hooks/`, `utils/`, `types/`, `assets/`, `styles/`). Path aliases are configured (e.g., `@components/Button`, `@pages/Home`).
- `server/`: Express API (`routes/`, `controllers/`, `models/`, `middleware/`, `utils/`, `scripts/`). Serves `dist/` in production and proxies `/api` in dev.
- `public/`: Static assets copied by Vite. `dist/`: production build output.
- `data/` and `uploads/`: JSON data and user-uploaded files (served at `/data` and `/uploads`).
- `scripts/`: one-off Node scripts for data mapping/audits.

## Build, Test, and Development Commands
- `npm run dev`: start Vite dev server (frontend).
- `npm run server:dev`: start API with nodemon at `:4000`.
- `npm run dev:full`: run frontend + API together (preferred for local work).
- `npm run build`: type-check then build to `dist/`.
- `npm run preview`: serve the built app locally.
- `npm run server`: start API in production mode (expects `dist/`).
- `npm run lint` / `lint:fix` / `format`: lint and format code.
- Reset utilities: `reset-all` and focused `reset-*` scripts to reseed core data.

Example: `FRONTEND_URL=http://localhost:5174 MONGODB_URI=mongodb://localhost:27017/anyventuredx npm run dev:full`

## Coding Style & Naming Conventions
- TypeScript strict mode. React with hooks and function components.
- Prettier: 2-space tabs, single quotes, semicolons, width 100, trailing commas (`.prettierrc`).
- ESLint: React Hooks + Prettier integration; Prettier violations are errors.
- Naming: components `PascalCase` (`CharacterSheet.tsx`), hooks `use*` (`useAuth.ts`), utilities `camelCase`.

## Testing Guidelines
- No formal automated tests yet. For API changes, verify `GET /api` returns `{ message: 'API is running' }` and smoke-test affected routes.
- When adding tests, prefer `*.test.ts(x)` colocated with source or under `__tests__/`. Aim for unit tests on utils and integration tests for routes.

## Commit & Pull Request Guidelines
- Git history is informal; prefer clear, imperative messages. Examples: `feat(auth): add Discord login`, `fix(items): correct core pricing map`, `chore: format with prettier`.
- PRs: include a concise description, linked issues, screenshots for UI, sample requests/responses for API changes, and steps to reproduce/verify. Ensure `npm run lint` and `npm run build` pass.

## Security & Configuration Tips
- Add `.env`: `MONGODB_URI`, `SESSION_SECRET`, `FRONTEND_URL`, optional `PORT`. Do not commit secrets.
- CORS and Vite proxy are set for `5174 -> 4000`. Update origins via env when deploying.
