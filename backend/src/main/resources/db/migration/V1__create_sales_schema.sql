CREATE TABLE orders (
    id UUID PRIMARY KEY,
    status VARCHAR(40) NOT NULL,
    payment_status VARCHAR(40) NOT NULL,
    payment_method VARCHAR(40),
    asaas_customer_id VARCHAR(80),
    asaas_payment_id VARCHAR(80),
    pix_payload TEXT,
    pix_qr_code_base64 TEXT,
    pix_expiration_at TIMESTAMPTZ,
    scoop_quantity SMALLINT NOT NULL,
    jewelry_category VARCHAR(20) NOT NULL,
    uses_rings BOOLEAN NOT NULL,
    ring_size VARCHAR(20),
    restrictions VARCHAR(500),
    social_media_consent BOOLEAN NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    email VARCHAR(160) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    zip_code VARCHAR(8) NOT NULL,
    street VARCHAR(160) NOT NULL,
    address_number VARCHAR(40) NOT NULL,
    complement VARCHAR(120),
    district VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(2) NOT NULL,
    unit_price_cents BIGINT NOT NULL,
    subtotal_cents BIGINT NOT NULL,
    discount_cents BIGINT NOT NULL,
    shipping_cents BIGINT NOT NULL,
    total_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_orders_scoop_quantity CHECK (scoop_quantity IN (1, 2, 3)),
    CONSTRAINT chk_orders_jewelry_category CHECK (jewelry_category IN ('GOLD', 'SILVER')),
    CONSTRAINT chk_orders_ring_size CHECK ((uses_rings = false AND ring_size IS NULL) OR (uses_rings = true AND ring_size IS NOT NULL)),
    CONSTRAINT chk_orders_social_media_consent_not_null CHECK (social_media_consent IS NOT NULL),
    CONSTRAINT chk_orders_non_negative_money CHECK (
        unit_price_cents >= 0 AND subtotal_cents >= 0 AND discount_cents >= 0 AND shipping_cents >= 0 AND total_cents >= 0
    )
);

CREATE INDEX idx_orders_asaas_payment_id ON orders (asaas_payment_id);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_created_at ON orders (created_at);

CREATE TABLE payment_webhook_events (
    id UUID PRIMARY KEY,
    asaas_event_id VARCHAR(120) NOT NULL UNIQUE,
    asaas_payment_id VARCHAR(80),
    event_type VARCHAR(80) NOT NULL,
    payload TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_payment_webhook_events_payment_id ON payment_webhook_events (asaas_payment_id);
