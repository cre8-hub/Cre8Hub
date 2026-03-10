-- Migration 002: Physical product support
-- Run this against your PostgreSQL database

-- Step 1: Create product_type enum
DO $$ BEGIN
  CREATE TYPE product_type AS ENUM ('DIGITAL', 'PHYSICAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add new columns to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type   product_type NOT NULL DEFAULT 'DIGITAL',
  ADD COLUMN IF NOT EXISTS file_url       TEXT,
  ADD COLUMN IF NOT EXISTS file_name      TEXT,
  ADD COLUMN IF NOT EXISTS inventory      INTEGER,
  ADD COLUMN IF NOT EXISTS weight_grams   INTEGER,
  ADD COLUMN IF NOT EXISTS ships_in_days  INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS sku            TEXT;

-- Step 3: Add shipping + tracking columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_type       product_type NOT NULL DEFAULT 'DIGITAL',
  ADD COLUMN IF NOT EXISTS shipping_name    TEXT,
  ADD COLUMN IF NOT EXISTS shipping_line1   TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city    TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state   TEXT,
  ADD COLUMN IF NOT EXISTS shipping_zip     TEXT,
  ADD COLUMN IF NOT EXISTS shipping_country TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number  TEXT,
  ADD COLUMN IF NOT EXISTS fulfilled_at     TIMESTAMPTZ;

-- Step 4: Ensure existing orders get DIGITAL type
UPDATE orders SET order_type = 'DIGITAL' WHERE order_type IS NULL;

-- Step 5: Ensure existing products get DIGITAL type
UPDATE products SET product_type = 'DIGITAL' WHERE product_type IS NULL;
