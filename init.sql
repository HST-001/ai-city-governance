-- 创建照片表
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    province VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    street VARCHAR(255),
    detailed_location TEXT,
    description TEXT,
    photo_type VARCHAR(50),
    tags TEXT[],
    uploaded_by VARCHAR(100),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating NUMERIC(5,2),
    ai_score_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建评分表
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
    user_id INTEGER,
    overall_score NUMERIC(5,2),
    dimension_scores JSONB,
    confidence NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_photos_upload_time ON photos(upload_time DESC);
CREATE INDEX IF NOT EXISTS idx_photos_photo_type ON photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_photos_location ON photos(province, city, district);
CREATE INDEX IF NOT EXISTS idx_ratings_photo_id ON ratings(photo_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();