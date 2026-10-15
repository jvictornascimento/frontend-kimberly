# Checkout protection

The backend always limits order/payment creation to five requests per client IP per 120-second window. The quota is shared by `POST /api/orders`, `POST /api/payments` and the legacy `POST /api/orders/{id}/payments/pix`. One order followed by one payment uses two requests. Invalid JSON, missing/invalid verification tokens and downstream failures also count. Five failures in the same cycle start a full 120-second block from completion of the fifth failure. Successful requests still consume the five-request window.

Blocked requests return HTTP 429 and `Retry-After` with the remaining seconds, do not extend the deadline and do not reach Cloudflare or payment/order services. The checkout preserves entered data, disables its submission buttons during the countdown and requests a fresh challenge on the next attempt. Webhooks, health checks, OPTIONS preflight, address lookup, shipping quotes, installment display and payment-status polling do not use this quota.

## Cloudflare Turnstile

Create a free Managed widget in Cloudflare Turnstile for the intended site hostnames. Set:

```dotenv
TURNSTILE_ENABLED=true
VITE_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_ALLOWED_HOSTNAMES=www.belyeve.com.br,belyeve.com.br
TURNSTILE_TIMEOUT_SECONDS=5
```

The site key is public and compiled into the frontend. The secret stays exclusively on the backend. Build the frontend again when changing its site key. Deploy frontend and backend with matching configuration. Turnstile is disabled by default until these values are supplied; the backend rate limit remains active independently. Empty `VITE_API_BASE_URL` keeps the existing mock checkout and skips Turnstile.

The Managed widget executes when the customer submits. It can complete automatically or request interaction, according to Cloudflare. Each order/payment request uses a new challenge: actions are `checkout_order` and `checkout_payment`, respectively. Tokens travel only in `X-Turnstile-Token`, remain outside session storage, and are validated server-to-server through Siteverify for success, exact hostname, action and timestamp. A token can be consumed only once by Cloudflare and expires in five minutes. Invalid/missing tokens, provider timeouts and unexpected responses cannot authorize an operation when enabled. Existing payment idempotency stays in the payment service.

Ensure any frontend CSP permits `https://challenges.cloudflare.com` for scripts and frames, and `connect-src` if your deployment restricts connections. No new CSP is imposed on the frontend by this change. The backend's API CSP remains restrictive.

## Trusted proxies — configure before VPS deployment

Spring automatic forwarded-header processing is disabled (`server.forward-headers-strategy=none`). `CHECKOUT_TRUSTED_PROXY_CIDRS` must list only the exact reverse proxy peer IPs or restricted network ranges allowed to supply `X-Forwarded-For`. An empty value ignores all forwarded headers. In Docker/reverse-proxy deployments, failing to configure this value groups customers under the proxy's IP and therefore its shared five-request quota.

The resolver walks the forwarded chain from right to left, trusting only configured hops, and stops at the first untrusted client. Headers supplied directly by an untrusted caller cannot choose another IP. `CF-Connecting-IP` is ignored by the application; if using Cloudflare, establish that trust and sanitize headers at your reverse proxy before forwarding. Hostnames and unrestricted `/0` proxy ranges are rejected. Do not trust arbitrary public networks.

The proxy must strip/overwrite untrusted forwarded headers or correctly append the actual connecting address, and direct public access to the backend must be restricted according to that trust model. For a single edge proxy, overwrite `X-Forwarded-For` with the actual client IP the proxy has verified. Keep HTTPS termination and HSTS on the public reverse proxy. This change does not provision or modify the VPS proxy.

## Counter lifetime

Counters are synchronized and held in backend memory, bounded to 10,000 active IP entries. Expired entries are reclaimed on access and capacity cleanup. At capacity, new IPs receive a temporary 429 instead of evicting active limits. There is one quota per running backend instance; restart clears counters. The current Compose topology runs one backend. Multiple replicas or limits that must survive restart need a shared store in a separate infrastructure task; no Redis or new service is added here.

## Validation

Tests use fake clocks and mocked providers: limits, cooldown expiry, separate IPs, parallel attempts, delayed completion, capacity cleanup, spoofed forwarded headers, malformed tokens, provider failure, hostname/action mismatch, expired/reused tokens and preservation of polling/webhooks. Browser adapter tests cover fresh order/payment widgets, SDK loading retries, expiry, cancellation and `Retry-After`. Real Turnstile validation requires configuring the widget and deploying the matching site/secret keys.

Official references: [free plan](https://developers.cloudflare.com/turnstile/plans/), [server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/), [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).
