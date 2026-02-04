# Cloudflare Turnstile (login & signup)

Turnstile is used on the **login** and **signup** pages to verify users. If the keys are not set, the widget is hidden and verification is skipped (useful for local dev).

## Setup

1. In [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Turnstile** → create a widget and get:
   - **Site Key** (public, for the frontend)
   - **Secret Key** (server-only, for verification)

2. **Frontend** (Next.js):

   - **Client (build-time):** set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` so the widget can render.
   - **Server (API routes):** set `TURNSTILE_SECRET_KEY` so `/api/auth/login` and `/api/auth/register` can verify the token with Cloudflare.

   Example `.env.local` or production env:

   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
   TURNSTILE_SECRET_KEY=0x4AAAAAAA...
   ```

3. **Production avec Docker**  
   - La clé **publique** est lue au **build** (ARG dans le Dockerfile, `build.args` dans docker-compose).  
   - La clé **secrète** est lue au **runtime** (`environment` dans docker-compose).  
   Définir les deux sur la machine qui lance le build/run, par exemple avec un fichier `.env` à la racine du frontend :

   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
   TURNSTILE_SECRET_KEY=0x4AAAAAAA...
   ```

   Puis :

   ```bash
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d
   ```

   Si les variables ne sont pas définies, le widget ne s’affiche pas et la vérification est désactivée (`:-` dans le compose).

4. If **only** `TURNSTILE_SECRET_KEY` is set (no site key), the API will require a token but the client won’t show the widget; set both for a working flow.

## Behavior

- **Login:** Widget on the form; token sent as `turnstile_token` in the login request body; API verifies with Cloudflare before calling the backend auth.
- **Signup:** Same: widget on the form, `turnstile_token` in the register body, verification in the register API route.
- **No keys:** Widget is not shown and token is not required (verification is skipped).
