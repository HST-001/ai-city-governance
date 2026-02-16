-- AI模型表
CREATE TABLE IF NOT EXISTS ai_models (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'inactive',
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    training_data_size VARCHAR(50),
    is_production BOOLEAN NOT NULL DEFAULT FALSE,
    model_path VARCHAR(500),
    training_task_id BIGINT,
    CONSTRAINT fk_ai_models_training_task FOREIGN KEY (training_task_id) REFERENCES training_tasks(id) ON DELETE SET NULL
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(type);
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_production ON ai_models(is_production);
CREATE INDEX IF NOT EXISTS idx_ai_models_training_task_id ON ai_models(training_task_id);

-- 添加注释
COMMENT ON TABLE ai_models IS 'AI模型表';
COMMENT ON COLUMN ai_models.name IS '模型名称';
COMMENT ON COLUMN ai_models.type IS '模型类型';
COMMENT ON COLUMN ai_models.description IS '模型描述';
COMMENT ON COLUMN ai_models.version IS '版本号';
COMMENT ON COLUMN ai_models.status IS '状态：active-启用, inactive-停用';
COMMENT ON COLUMN ai_models.accuracy IS '准确率';
COMMENT ON COLUMN ai_models.created_at IS '创建时间';
COMMENT ON COLUMN ai_models.updated_at IS '更新时间';
COMMENT ON COLUMN ai_models.created_by IS '创建者用户ID';
COMMENT ON COLUMN ai_models.training_data_size IS '训练数据大小';
COMMENT ON COLUMN ai_models.is_production IS '是否生产环境';
COMMENT ON COLUMN ai_models.model_path IS '模型文件存储路径';
COMMENT ON COLUMN ai_models.training_task_id IS '关联的训练任务ID';
