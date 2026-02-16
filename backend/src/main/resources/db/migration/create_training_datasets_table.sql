-- 训练数据集表
CREATE TABLE IF NOT EXISTS training_datasets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_count INTEGER NOT NULL DEFAULT 0,
    file_size VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processing',
    storage_path VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_training_datasets_status ON training_datasets(status);
CREATE INDEX IF NOT EXISTS idx_training_datasets_uploaded_by ON training_datasets(uploaded_by);

-- 添加注释
COMMENT ON TABLE training_datasets IS '训练数据集表';
COMMENT ON COLUMN training_datasets.name IS '数据集名称';
COMMENT ON COLUMN training_datasets.description IS '数据集描述';
COMMENT ON COLUMN training_datasets.file_count IS '文件数量';
COMMENT ON COLUMN training_datasets.file_size IS '文件大小';
COMMENT ON COLUMN training_datasets.uploaded_at IS '上传时间';
COMMENT ON COLUMN training_datasets.uploaded_by IS '上传用户ID';
COMMENT ON COLUMN training_datasets.status IS '状态：available-可用, processing-处理中, deprecated-已废弃';
COMMENT ON COLUMN training_datasets.storage_path IS '存储路径';
