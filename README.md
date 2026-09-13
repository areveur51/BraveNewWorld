# Brave New World

A static cinematic landing page. A looping background plays behind a brass-and-teal CRT overlay that types a short manifesto one letter at a time, at speaking cadence.

No database, no accounts, no API keys.

## Quick start

```bash
python3 -m http.server 8080 --directory public
```

Open http://127.0.0.1:8080/

Or use the helper script:

```bash
./bravenewworldctl.sh start
./bravenewworldctl.sh status
./bravenewworldctl.sh stop
```

The helper honors `PORT` or `BRAVENEWWORLD_PORT` (default `5230`) and `BRAVENEWWORLD_BIND` (default all interfaces). For a machine-local only server, set `BRAVENEWWORLD_BIND=127.0.0.1`.

## Background clip

Optional. Place a muted looping video at `public/media/bg-clip.mp4`. If the file is missing, reduced-motion is on, or the video fails to play, the page uses the still scenes in `public/media/`.

Do **not** commit studio footage, trailers, or files with network marks. That clip is gitignored on purpose.

## Layout

```
public/
  index.html
  styles.css
  app.js
  media/          stills (and your local bg-clip.mp4)
bravenewworldctl.sh
```

## Deploy on Render (areveur.com)

This repo includes a [Render Blueprint](https://render.com/docs/infrastructure-as-code) at [`render.yaml`](render.yaml). It publishes the `public/` directory and auto-deploys on every push to `main`.

The optional local `bg-clip.mp4` is gitignored, so production uses the still scenes unless you add a clip on the host.

### 1. Create the static site

In the [Render Dashboard](https://dashboard.render.com):

1. **New → Blueprint** (or **New → Static Site**).
2. Connect GitHub and select **areveur51/BraveNewWorld**.
3. Confirm:
   - **Branch:** `main`
   - **Build command:** `true` (no compile step)
   - **Publish directory:** `public`
4. Create the service. Render assigns a `*.onrender.com` URL and redeploys on later pushes.

Or with an API key (do not commit it):

```bash
export RENDER_API_KEY='…'   # Account Settings → API Keys
# Then ask this agent to create the service and attach areveur.com
```

### 2. Point areveur.com at Render

`areveur.com` is on Cloudflare today. After the service exists:

1. In Render: **Settings → Custom Domains → Add** `areveur.com` (Render also adds `www`).
2. In Cloudflare **DNS**, replace the apex/`www` records with CNAMEs to the service’s `onrender.com` hostname.
   - Name `@` → target `bravenewworld.onrender.com` (use the hostname Render shows)
   - Name `www` → same target
   - **Proxy status: DNS only** until Render issues the certificate, then you can re-enable the proxy
3. Cloudflare **SSL/TLS** mode: **Full**.
4. Remove any **AAAA** records for the apex/`www` (Render does not serve IPv6 yet).

This replaces whatever currently answers on areveur.com.

## License

MIT. See [LICENSE](LICENSE).

