-- Modelos
INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4.1-nano-2025-04-14', 0.00000010, 0.00000040, 'OpenAI', 'Ultra barato y eficiente para tareas básicas', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4o-mini-2024-07-18', 0.00000015, 0.00000060, 'OpenAI', 'Ideal para respuestas rápidas con bajo costo', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-4.1-mini-2025-04-14', 0.00000040, 0.00000160, 'OpenAI', 'Mini versión de GPT-4.1 para uso general', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-3.5-turbo', 0.00000050, 0.00000150, 'OpenAI', 'Modelo confiable para conversaciones largas', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('o4-mini-2025-04-16', 0.00000110, 0.00000440, 'OpenAI', 'Modelo potente con gran capacidad de razonamiento', 0.20, NOW(), NOW())
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