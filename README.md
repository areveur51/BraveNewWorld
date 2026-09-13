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

## License

MIT. See [LICENSE](LICENSE).
