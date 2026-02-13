-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_es VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_es TEXT,
  content_en TEXT,
  content_es TEXT,
  image_url VARCHAR(500),
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
