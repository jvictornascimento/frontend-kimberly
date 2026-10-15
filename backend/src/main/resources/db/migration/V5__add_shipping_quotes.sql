CREATE TABLE shipping_quotes (
    id UUID PRIMARY KEY,
    zip_code VARCHAR(8) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity IN (1, 2, 3)),
    subtotal_cents BIGINT NOT NULL CHECK (subtotal_cents > 0),
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('local', 'sandbox', 'production')),
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('local_delivery', 'carrier')),
    carrier VARCHAR(120) NOT NULL,
    service VARCHAR(120) NOT NULL,
    provider_service_id INTEGER,
    price_cents BIGINT NOT NULL,
    min_days INTEGER,
    max_days INTEGER,
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_shipping_quote_kind CHECK (
        (kind = 'local_delivery' AND environment = 'local' AND price_cents = 0 AND provider_service_id IS NULL AND min_days IS NULL AND max_days IS NULL)
        OR (kind = 'carrier' AND environment IN ('sandbox', 'production') AND price_cents > 0
            AND provider_service_id IS NOT NULL AND min_days IS NOT NULL AND max_days IS NOT NULL AND provider_service_id > 0
            AND min_days BETWEEN 1 AND 365 AND max_days BETWEEN min_days AND 365)
    )
);

ALTER TABLE orders ADD COLUMN shipping_quote_id UUID REFERENCES shipping_quotes(id);
ALTER TABLE orders ADD COLUMN shipping_kind VARCHAR(20);
ALTER TABLE orders ADD COLUMN shipping_carrier VARCHAR(120);
ALTER TABLE orders ADD COLUMN shipping_service VARCHAR(120);
ALTER TABLE orders ADD COLUMN shipping_environment VARCHAR(20);
ALTER TABLE orders ADD COLUMN shipping_provider_service_id INTEGER;
ALTER TABLE orders ADD COLUMN shipping_min_days INTEGER;
ALTER TABLE orders ADD COLUMN shipping_max_days INTEGER;
-- Old orders keep their original shipping amount; never backfill fabricated carrier data.
