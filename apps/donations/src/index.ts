/**
 * Donations Worker: serves the amount raised per school (value-generator map
 * point) from Darujme.sk feeds, without exposing the feed IDs.
 *
 * Darujme feeds are public JSON but list donor names and e-mails, so their IDs
 * must not reach the browser. They live in the private Sanity document
 * `secrets.darujmeFeeds` (dotted ID = readable only with a token). This Worker
 * reads that mapping, asks Darujme for each feed's `metadata.total_amount` and
 * returns only `{ amounts: { <school _key>: <EUR> } }`.
 *
 * Both upstreams are shielded by the Cache API (per data center), so traffic to
 * Sanity and Darujme does not grow with page views.
 */

const FEEDS_DOC_ID = 'secrets.darujmeFeeds';
const FEEDS_QUERY = `*[_id == $id][0].feeds[defined(schoolKey) && defined(feedId)]{ schoolKey, feedId }`;

/** Edge cache lifetimes (seconds). */
const AMOUNTS_TTL = 300; // fresh enough for a fundraising bar
const PARTIAL_TTL = 60; // retry sooner when some feeds failed
const FEEDS_TTL = 1800; // the mapping only changes when editors edit it
const BROWSER_TTL = 60;

const UPSTREAM_TIMEOUT_MS = 5000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Feed = { schoolKey: string; feedId: string };
type AmountsBody = { amounts: Record<string, number>; updatedAt: string };

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname !== '/amounts') {
			return json({ error: 'Not found' }, 404);
		}
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}
		if (request.method !== 'GET') {
			return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, OPTIONS' });
		}

		const cache = caches.default;
		// Ignore query strings so callers cannot bypass the cache.
		const cacheKey = new Request(new URL('/amounts', url).toString());
		const cached = await cache.match(cacheKey);
		if (cached) return withClientHeaders(cached);

		try {
			const feeds = await loadFeeds(env, ctx, url);
			const results = await Promise.all(
				feeds.map(async (f) => [f.schoolKey, await fetchTotal(f.feedId)] as const),
			);

			const amounts: Record<string, number> = {};
			let failed = 0;
			for (const [key, total] of results) {
				if (total === null) failed++;
				else amounts[key] = total;
			}
			if (failed > 0) {
				console.log(JSON.stringify({ message: 'darujme feeds failed', failed, total: feeds.length }));
			}

			const body: AmountsBody = { amounts, updatedAt: new Date().toISOString() };
			const response = json(body, 200, {
				'Cache-Control': `public, s-maxage=${failed > 0 ? PARTIAL_TTL : AMOUNTS_TTL}`,
			});
			ctx.waitUntil(cache.put(cacheKey, response.clone()));
			return withClientHeaders(response);
		} catch (err) {
			console.error(JSON.stringify({ message: 'amounts failed', error: String(err) }));
			// Not cached: the next request retries. The website keeps its build-time amounts.
			return json({ error: 'Upstream error' }, 502, CORS_HEADERS);
		}
	},
} satisfies ExportedHandler<Env>;

/** Feed mapping from the private Sanity document, cached separately (changes rarely). */
async function loadFeeds(env: Env, ctx: ExecutionContext, url: URL): Promise<Feed[]> {
	const cache = caches.default;
	// Internal cache key; the router never serves this path, only the code reads it.
	const cacheKey = new Request(new URL('/__cache/feeds', url).toString());
	const cached = await cache.match(cacheKey);
	if (cached) return cached.json<Feed[]>();

	const api = new URL(
		`https://${env.SANITY_PROJECT_ID}.api.sanity.io/v${env.SANITY_API_VERSION}/data/query/${env.SANITY_DATASET}`,
	);
	api.searchParams.set('query', FEEDS_QUERY);
	api.searchParams.set('$id', JSON.stringify(FEEDS_DOC_ID));
	// Published document only (no drafts of the mapping).
	api.searchParams.set('perspective', 'published');

	const res = await fetch(api, {
		headers: { Authorization: `Bearer ${env.SANITY_READ_TOKEN}` },
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
	});
	if (!res.ok) throw new Error(`Sanity ${res.status}`);

	const { result } = await res.json<{ result: Feed[] | null }>();
	const feeds = (result ?? []).filter((f) => UUID.test(f.feedId));

	ctx.waitUntil(
		cache.put(
			cacheKey,
			Response.json(feeds, { headers: { 'Cache-Control': `public, s-maxage=${FEEDS_TTL}` } }),
		),
	);
	return feeds;
}

/** Total raised for one Darujme feed, or null on failure. Donor data is never forwarded. */
async function fetchTotal(feedId: string): Promise<number | null> {
	try {
		const res = await fetch(
			`https://api.darujme.sk/v1/feeds/${encodeURIComponent(feedId)}/donations/?per_page=1`,
			{ signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) },
		);
		if (!res.ok) return null;
		const data = await res.json<{ response?: { metadata?: { total_amount?: unknown } } }>();
		const total = Number(data.response?.metadata?.total_amount);
		return Number.isFinite(total) ? total : null;
	} catch {
		return null;
	}
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
	return Response.json(body, { status, headers });
}

/** CORS + a short browser cache on top of the (edge-cached) response. */
function withClientHeaders(response: Response): Response {
	const out = new Response(response.body, response);
	for (const [k, v] of Object.entries(CORS_HEADERS)) out.headers.set(k, v);
	out.headers.set('Cache-Control', `public, max-age=${BROWSER_TTL}`);
	return out;
}
