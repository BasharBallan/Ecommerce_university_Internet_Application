-- ============================================================================
-- University Milestone 3: Database Slow Query Analysis with EXPLAIN & EXPLAIN ANALYZE
-- Database: inventory_db (MySQL 8.0) | Dataset: 10,050 products + 10,055 inventories
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SLOW QUERY #1: Filter by Category + Sort by Created_at
-- Scenario: Customer views all products in 'Canned' category sorted by newest
-- ----------------------------------------------------------------------------

-- A) BEFORE INDEXING (Simulated by ignoring created composite index)
SELECT '--- [QUERY 1: BEFORE INDEXING] ---' AS Status;
EXPLAIN 
SELECT * FROM products 
IGNORE INDEX (idx_products_category_created_at, idx_products_category_price, idx_products_created_at, idx_products_price, idx_products_title) 
WHERE category = 'Canned' 
ORDER BY created_at DESC 
LIMIT 20;

EXPLAIN ANALYZE 
SELECT * FROM products 
IGNORE INDEX (idx_products_category_created_at, idx_products_category_price, idx_products_created_at, idx_products_price, idx_products_title) 
WHERE category = 'Canned' 
ORDER BY created_at DESC 
LIMIT 20;

-- B) AFTER COMPOSITE INDEXING (idx_products_category_created_at)
SELECT '--- [QUERY 1: AFTER INDEXING] ---' AS Status;
EXPLAIN 
SELECT * FROM products 
WHERE category = 'Canned' 
ORDER BY created_at DESC 
LIMIT 20;

EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE category = 'Canned' 
ORDER BY created_at DESC 
LIMIT 20;


-- ----------------------------------------------------------------------------
-- 2. SLOW QUERY #2: Filter by Category + Filter by Price Range + Sort by Price
-- Scenario: Customer filters 'Canned' products with price <= $100
-- ----------------------------------------------------------------------------

-- A) BEFORE INDEXING
SELECT '--- [QUERY 2: BEFORE INDEXING] ---' AS Status;
EXPLAIN 
SELECT * FROM products 
IGNORE INDEX (idx_products_category_created_at, idx_products_category_price, idx_products_created_at, idx_products_price, idx_products_title) 
WHERE category = 'Canned' AND price <= 100 
ORDER BY price ASC;

EXPLAIN ANALYZE 
SELECT * FROM products 
IGNORE INDEX (idx_products_category_created_at, idx_products_category_price, idx_products_created_at, idx_products_price, idx_products_title) 
WHERE category = 'Canned' AND price <= 100 
ORDER BY price ASC;

-- B) AFTER COMPOSITE INDEXING (idx_products_category_price)
SELECT '--- [QUERY 2: AFTER INDEXING] ---' AS Status;
EXPLAIN 
SELECT * FROM products 
WHERE category = 'Canned' AND price <= 100 
ORDER BY price ASC;

EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE category = 'Canned' AND price <= 100 
ORDER BY price ASC;


-- ----------------------------------------------------------------------------
-- 3. N+1 QUERY ELIMINATION EXPLAIN
-- Before: 1 query for products + N individual queries for inventory
-- After: 1 query for products + 1 query using WHERE product_id IN (...)
-- ----------------------------------------------------------------------------
SELECT '--- [EAGER LOADING QUERY FOR INVENTORY RELATION (N+1 SOLVED)] ---' AS Status;
EXPLAIN 
SELECT * FROM inventories 
WHERE product_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);

EXPLAIN ANALYZE 
SELECT * FROM inventories 
WHERE product_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
