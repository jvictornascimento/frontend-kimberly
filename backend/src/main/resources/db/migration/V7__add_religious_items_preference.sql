-- Leave historical orders unknown; never infer acceptance from a missing answer.
ALTER TABLE orders ADD COLUMN allows_religious_items BOOLEAN;
