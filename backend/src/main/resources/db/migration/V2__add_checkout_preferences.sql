ALTER TABLE orders
    ADD COLUMN allows_male_pieces BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN male_jewelry_category VARCHAR(20),
    ADD COLUMN allows_piercing BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN piercing_locations VARCHAR(80);

ALTER TABLE orders
    DROP CONSTRAINT chk_orders_jewelry_category;

ALTER TABLE orders
    ADD CONSTRAINT chk_orders_jewelry_category
        CHECK (jewelry_category IN ('GOLD', 'SILVER', 'MIXED')),
    ADD CONSTRAINT chk_orders_male_pieces
        CHECK (
            (allows_male_pieces = false AND male_jewelry_category IS NULL)
            OR (allows_male_pieces = true AND male_jewelry_category IN ('GOLD', 'SILVER', 'MIXED'))
        ),
    ADD CONSTRAINT chk_orders_piercing
        CHECK (
            (allows_piercing = false AND piercing_locations IS NULL)
            OR (allows_piercing = true AND piercing_locations IS NOT NULL)
        );
