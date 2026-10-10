-- Match the Java int mapping while preserving the existing quantity constraint.
ALTER TABLE orders ALTER COLUMN scoop_quantity TYPE INTEGER;
