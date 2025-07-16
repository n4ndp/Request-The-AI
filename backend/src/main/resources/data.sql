-- ===================================================================
-- INICIALIZACIÓN Y ACTUALIZACIÓN DE DATOS PARA REQUEST THE AI
-- ===================================================================

-- Insertar/actualizar modelos principales
INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4o-mini', 0.0005, 0.0004, 'OpenAI', 'Faster, more affordable reasoning model', 0.20, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET 
    price_input = EXCLUDED.price_input,
    price_output = EXCLUDED.price_output,
    provider = EXCLUDED.provider,
    description = EXCLUDED.description,
    profit_margin = EXCLUDED.profit_margin,
    updated_at = NOW();

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-3.5-turbo', 0.00000050, 0.00000150, 'OpenAI', 'Fast and efficient for most tasks', 0.20, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET 
    price_input = EXCLUDED.price_input,
    price_output = EXCLUDED.price_output,
    provider = EXCLUDED.provider,
    description = EXCLUDED.description,
    profit_margin = EXCLUDED.profit_margin,
    updated_at = NOW();

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4o', 0.0015, 0.0014, 'Anthropic', 'Flagship GPT model for complex tasks', 0.20, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET 
    price_input = EXCLUDED.price_input,
    price_output = EXCLUDED.price_output,
    provider = EXCLUDED.provider,
    description = EXCLUDED.description,
    profit_margin = EXCLUDED.profit_margin,
    updated_at = NOW();

-- -------------------------------------------------------------------
-- USUARIO ADMINISTRADOR
-- -------------------------------------------------------------------

-- Insertar usuario admin
INSERT INTO users (username, password) 
VALUES ('admin', '$2a$10$TiiWhSAEwdcjgWwX7O.lHOefZFOOvKrjSC7WhytwMQgtD3URxiaCm') 
ON CONFLICT (username) DO NOTHING;

-- Insertar cuenta admin
INSERT INTO accounts (full_name, email, role, status, balance, user_id, created_at, updated_at)
SELECT 'Administrador Principal', 'admin@requesttheai.com', 'ADMIN', 'ACTIVE', 0.00, id, NOW(), NOW()
FROM users WHERE username = 'admin'
ON CONFLICT (email) DO NOTHING;

-- -------------------------------------------------------------------
-- MIGRACIÓN DE DATOS EXISTENTES: POBLAR user_id y model_name EN USAGES
-- -------------------------------------------------------------------

-- Poblar user_id y model_name para registros de usage existentes que no los tienen
-- Esto es necesario para mantener compatibilidad con datos existentes
UPDATE usages 
SET user_id = (
    SELECT c.user_id 
    FROM messages m 
    JOIN conversations c ON m.conversation_id = c.id 
    WHERE m.id = usages.message_id
),
model_name = (
    SELECT mo.name 
    FROM messages m 
    JOIN models mo ON m.model_id = mo.id 
    WHERE m.id = usages.message_id
)
WHERE usages.message_id IS NOT NULL 
  AND (usages.user_id IS NULL OR usages.model_name IS NULL);