# donations — Cloudflare Worker

Serves the amount raised per school for the school list under the
Generátor hodnôt map: `GET /amounts` → `{ "amounts": { "<mapPoint _key>": 152.67 }, "updatedAt": "…" }`.

Why a Worker: Darujme.sk feeds (`api.darujme.sk/v1/feeds/<id>/donations/`) are
public but list donor names and e-mails, so feed IDs must never reach the
browser. They are stored in the private Sanity document `secrets.darujmeFeeds`
(a dot in `_id` = readable only with a token, even in a public dataset) and
only this Worker reads them.

Flow: Sanity mapping (cached 30 min) → `metadata.total_amount` of each feed
(`per_page=1`) → response cached 5 min at the edge (1 min if some feed failed),
60 s in the browser. Errors are not cached; the website then keeps the
build-time amounts.

## Setup

```sh
pnpm install
# Sanity read-only token (sanity.io/manage → API → Tokens → Viewer):
pnpm --filter donations exec wrangler secret put SANITY_READ_TOKEN
pnpm --filter donations run deploy
```

The Worker is served on `https://muzeum-hodnot-donations.<account>.workers.dev`.
Set that origin as `NEXT_PUBLIC_DONATIONS_API_URL` for the website (GitHub repo
variable for the Pages build, `apps/web/.env.local` locally).

Local dev: put `SANITY_READ_TOKEN=…` into `apps/donations/.dev.vars`
(git-ignored) and run `pnpm --filter donations dev`.

After changing `wrangler.jsonc`, regenerate `worker-configuration.d.ts` with
`pnpm --filter donations types`.
