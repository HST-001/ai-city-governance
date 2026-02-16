-- 评分结果表
CREATE TABLE IF NOT EXISTS rating_results (
    id BIGSERIAL PRIMARY KEY,
    photo_id BIGINT,
    model_id BIGINT NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    overall_rating DECIMAL(3,1) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    analyzed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shop_sign_building DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    greenery_maintenance DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    greenery_coverage DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    sidewalk_damage DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    bike_lane_connectivity DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    urban_facilities_integrity DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    urban_facilities_damage DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    other DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_results_photo FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_results_model FOREIGN KEY (model_id) REFERENCES ai_models(id) ON DELETE CASCADE
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_rating_results_photo_id ON rating_results(photo_id);
CREATE INDEX IF NOT EXISTS idx_rating_results_model_id ON rating_results(model_id);
CREATE INDEX IF NOT EXISTS idx_rating_results_analyzed_at ON rating_results(analyzed_at);

-- 添加注释
COMMENT ON TABLE rating_results IS '评分结果表';
COMMENT ON COLUMN rating_results.photo_id IS '照片ID';
COMMENT ON COLUMN rating_results.model_id IS '使用的模型ID';
COMMENT ON COLUMN rating_results.model_name IS '模型名称';
COMMENT ON COLUMN rating_results.overall_rating IS '综合评分(0-5)';
COMMENT ON COLUMN rating_results.confidence IS '置信度(0-100)';
COMMENT ON COLUMN rating_results.analyzed_at IS '分析时间';
COMMENT ON COLUMN rating_results.shop_sign_building IS '店招/建筑美观度(0-5)';
COMMENT ON COLUMN rating_results.greenery_maintenance IS '绿化养护达标度(0-5)';
COMMENT ON COLUMN rating_results.greenery_coverage IS '绿化覆盖率(0-5)';
COMMENT ON COLUMN rating_results.sidewalk_damage IS '人行道破损程度(0-5)';
COMMENT ON COLUMN rating_results.bike_lane_connectivity IS '自行车道连通性(0-5)';
COMMENT ON COLUMN rating_results.urban_facilities_integrity IS '城市设施/家具完善度(0-5)';
COMMENT ON COLUMN rating_results.urban_facilities_damage IS '城市设施/家具破损程度(0-5)';
COMMENT ON COLUMN rating_results.other IS '其他(0-5)';
