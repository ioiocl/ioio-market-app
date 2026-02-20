-- Migration: Add CTA (Call-to-Action) fields to banners table
-- Date: 2026-02-13
-- Description: Adds configurable button text and action URL for banners

-- Add CTA fields to banners table
ALTER TABLE banners ADD COLUMN IF NOT EXISTS cta_text_en VARCHAR(100);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS cta_text_es VARCHAR(100);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS cta_url VARCHAR(500);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS show_cta BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN banners.cta_text_en IS 'Call-to-action button text in English';
COMMENT ON COLUMN banners.cta_text_es IS 'Call-to-action button text in Spanish';
COMMENT ON COLUMN banners.cta_url IS 'URL for the call-to-action button';
COMMENT ON COLUMN banners.show_cta IS 'Whether to show the CTA button on this banner';
