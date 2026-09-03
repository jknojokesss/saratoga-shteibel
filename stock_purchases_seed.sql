-- Stock purchases SQL
-- Run in Supabase SQL Editor AFTER getting your client ID for Reydel Tire

-- Step 1: Get your client_id
-- SELECT id FROM clients WHERE name ILIKE '%reydel%';
-- Then replace 'YOUR_CLIENT_ID' below with that UUID.

CREATE TABLE IF NOT EXISTS stock_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  item_label TEXT NOT NULL,
  qty_purchased INT NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  track_clover_sales BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE stock_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS stock_purchases_client ON stock_purchases FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
    OR EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

-- Clear existing data first (safe to re-run)
DELETE FROM stock_purchases WHERE client_id = 'YOUR_CLIENT_ID';

-- ── PART 1: Main 4/15 purchase (Weldon/Cooper) — Clover sales tracked ──
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '205/55/16', 16, 48.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '205/55/16 Cooper', 4, 96.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '205/65/16', 16, 53.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '205/65/16 Cooper', 4, 105.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '215/55/17', 20, 59.80, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '215/55/17 Cooper', 4, 119.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '215/60/16', 16, 59.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '215/60/16 Cooper', 4, 98.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '215/65/16', 16, 61.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '215/65/16 Cooper', 4, 102.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '225/50/17', 16, 58.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '225/50/17 Cooper', 4, 128.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '225/65/17', 16, 69.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '225/65/17 Cooper', 4, 115.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/45/18', 15, 62.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/45/18 Cooper', 4, 142.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/55/19', 16, 76.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/55/19 Cooper', 4, 160.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/60/17', 16, 65.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/60/17 Cooper', 4, 130.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/60/18', 16, 74.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/60/18 Cooper', 4, 145.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/65/16 LT', 16, 85.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/65/16 LT Kumho', 4, 147.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/65/17', 16, 72.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/65/17 Cooper', 4, 130.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/65/18', 16, 77.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '235/65/18 Cooper', 4, 143.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '245/50/20', 16, 85.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '245/50/20 Cooper', 4, 158.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '245/60/18', 16, 74.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '245/60/18 Cooper', 4, 164.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '255/40/20', 16, 90.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '255/40/20 Falken', 4, 200.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '255/45/19', 16, 85.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '255/45/19 Cooper', 4, 179.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '285/45/22', 16, 105.00, TRUE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', '285/45/22 Goodyear', 4, 189.00, TRUE);
-- Subtotal: 38 rows, $32502.00 opening value

-- ── PART 2: Other inventory batch — NOT deducted via Clover ──
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Arroyo 235/60/17', 10, 68.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'General 275/50/22', 2, 213.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Greenmax 195/65/15', 3, 49.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 255/55/20', 1, 104.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Copper 235/65/17', 1, 155.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire 235/65/18', 8, 95.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Ironman 235/60/17', 10, 96.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Mavis 235/60/18', 10, 98.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Falken 225/60/18', 2, 193.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 215/55/17', 6, 72.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire 205/55/16', 4, 64.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Greenmax 235/55/19', 5, 75.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Mavis 225/65/17', 4, 72.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire LT245/75/16', 4, 94.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire 235/65/17', 6, 90.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 215/60/16', 6, 65.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 205/65/16', 6, 70.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 215/65/16', 4, 69.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Caprecorn 255/50/20', 2, 88.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire 245/50/20', 2, 95.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire 235/45/18', 6, 74.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 255/45/19', 4, 147.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 235/65/16/C', 4, 89.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Cambridge 225/50/17', 2, 69.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Arroyo 255/40/20', 3, 144.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 215/45/17', 2, 67.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire 205/65/15', 1, 72.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Veerubber 235/75/15', 2, 76.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Mavis 235/60/18', 1, 98.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Greenmax 235/65/18', 2, 84.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Kumho 235/60/17', 2, 121.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Starfire 215/45/17', 1, 60.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 215/60/16', 1, 65.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'STarfire 235/55/17', 1, 72.00, FALSE);
INSERT INTO stock_purchases (client_id, item_label, qty_purchased, unit_cost, track_clover_sales) VALUES ('YOUR_CLIENT_ID', 'Blackhawk 255/45/19', 1, 147.00, FALSE);
-- Subtotal: 35 rows, $11485.00 opening value
-- Grand total opening: $43987.00
