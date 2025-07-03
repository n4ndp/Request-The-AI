INSERT INTO models (name, price_input, price_output, provider, description, profit_margin) 
VALUES ('gpt-4.1-mini', 0.00000048, 0.00000012, 'OpenAI', 'Versión ligera de GPT-4.1, ideal para tareas rápidas', 0.20)
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin) 
VALUES ('gpt-4o', 0.00000300, 0.00000150, 'OpenAI', 'Modelo multimodal más avanzado (texto, audio, imagen)', 0.20)
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin) 
VALUES ('gpt-3.5-turbo', 0.00000060, 0.00000180, 'Anthropic', 'Modelo económico para chats simples', 0.20)
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (name, price_input, price_output, provider, description, profit_margin) 
VALUES ('gpt-4o-mini', 0.00000018, 0.00000009, 'Anthropic', 'Versión compacta de GPT-4o para respuestas rápidas', 0.20)
ON CONFLICT (name) DO NOTHING;