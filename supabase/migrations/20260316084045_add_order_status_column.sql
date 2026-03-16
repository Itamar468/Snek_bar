/*
  # Add order blocking/rejection status

  1. Changes
    - Add 'blocked' column to orders table to distinguish between rejected and blocked orders
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'blocked'
  ) THEN
    ALTER TABLE orders ADD COLUMN blocked boolean DEFAULT false;
  END IF;
END $$;