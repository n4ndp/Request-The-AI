-- Script para actualizar modelos existentes con nombres correctos de OpenAI

-- Actualizar modelo o4-mini-2025-04-16 a gpt-4o-mini
UPDATE models 
SET name = 'gpt-4o-mini', 
    description = 'Faster, more affordable reasoning model',
    updated_at = NOW()
WHERE name = 'o4-mini-2025-04-16';

-- Actualizar modelo gpt-4.1-2025-04-14 a gpt-4o
UPDATE models 
SET name = 'gpt-4o', 
    description = 'Flagship GPT model for complex tasks',
    updated_at = NOW()
WHERE name = 'gpt-4.1-2025-04-14';

-- Insertar gpt-3.5-turbo si no existe
INSERT INTO models (name, price_input, price_output, provider, description, profit_margin, created_at, updated_at) 
VALUES 
('gpt-3.5-turbo', 0.00000050, 0.00000150, 'OpenAI', 'Fast and efficient for most tasks', 0.20, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verificar los modelos actualizados
SELECT id, name, provider, description, created_at, updated_at FROM models ORDER BY name; 