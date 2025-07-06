-- Modelos
INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4.1-mini', 0.00000048, 0.00000012, 'OpenAI', 'Versión ligera de GPT-4.1, ideal para tareas rápidas', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4o', 0.00000300, 0.00000150, 'OpenAI', 'Modelo multimodal más avanzado (texto, audio, imagen)', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-3.5-turbo', 0.00000060, 0.00000180, 'Anthropic', 'Modelo económico para chats simples', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4o-mini', 0.00000018, 0.00000009, 'Anthropic', 'Versión compacta de GPT-4o para respuestas rápidas', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Usuario admin
INSERT INTO users (username, password) 
VALUES ('admin', '$2a$10$TiiWhSAEwdcjgWwX7O.lHOefZFOOvKrjSC7WhytwMQgtD3URxiaCm') 
ON CONFLICT (username) DO NOTHING;

-- Cuenta admin
INSERT INTO accounts (full_name, email, role, status, balance, user_id, created_at, updated_at)
SELECT 'Administrador Principal', 'admin@requesttheai.com', 'ADMIN', 'ACTIVE', 0.00, id, NOW(), NOW()
FROM users WHERE username = 'admin'
ON CONFLICT (email) DO NOTHING;