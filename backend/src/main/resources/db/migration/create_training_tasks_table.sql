-- 训练任务表
CREATE TABLE IF NOT EXISTS training_tasks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0,
    photo_count INTEGER NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    trained_by BIGINT NOT NULL,
    dataset_id BIGINT,
    model_path VARCHAR(500),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_training_tasks_dataset FOREIGN KEY (dataset_id) REFERENCES training_datasets(id) ON DELETE SET NULL
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_training_tasks_status ON training_tasks(status);
CREATE INDEX IF NOT EXISTS idx_training_tasks_model_type ON training_tasks(model_type);
CREATE INDEX IF NOT EXISTS idx_training_tasks_dataset_id ON training_tasks(dataset_id);

-- 添加注释
COMMENT ON TABLE training_tasks IS '训练任务表';
COMMENT ON COLUMN training_tasks.name IS '任务名称';
COMMENT ON COLUMN training_tasks.description IS '任务描述';
COMMENT ON COLUMN training_tasks.model_type IS '模型类型';
COMMENT ON COLUMN training_tasks.status IS '状态：pending-待开始, training-训练中, completed-已完成, failed-失败';
COMMENT ON COLUMN training_tasks.progress IS '训练进度(0-100)';
COMMENT ON COLUMN training_tasks.photo_count IS '训练照片数量';
COMMENT ON COLUMN training_tasks.accuracy IS '准确率';
COMMENT ON COLUMN training_tasks.created_at IS '创建时间';
COMMENT ON COLUMN training_tasks.completed_at IS '完成时间';
COMMENT ON COLUMN training_tasks.trained_by IS '训练者用户ID';
COMMENT ON COLUMN training_tasks.dataset_id IS '使用的训练数据集ID';
COMMENT ON COLUMN training_tasks.model_path IS '模型文件存储路径';
