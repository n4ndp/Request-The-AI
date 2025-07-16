-- Migration to add user_id and model_name columns to usages table
-- This fixes the issue where usage history disappears when conversations are deleted

-- Add the new columns
ALTER TABLE usages 
ADD COLUMN user_id BIGINT,
ADD COLUMN model_name VARCHAR(100);

-- Create index for performance
CREATE INDEX idx_usages_user_id ON usages(user_id);

-- Populate existing records with data from related tables
UPDATE usages u 
SET user_id = (
    SELECT c.user_id 
    FROM messages m 
    JOIN conversations c ON m.conversation_id = c.id 
    WHERE m.id = u.message_id
),
model_name = (
    SELECT mo.name 
    FROM messages m 
    JOIN models mo ON m.model_id = mo.id 
    WHERE m.id = u.message_id
)
WHERE u.message_id IS NOT NULL;

-- Make user_id and model_name NOT NULL after populating existing data
ALTER TABLE usages 
MODIFY COLUMN user_id BIGINT NOT NULL,
MODIFY COLUMN model_name VARCHAR(100) NOT NULL;

-- Add foreign key constraint
ALTER TABLE usages 
ADD CONSTRAINT fk_usages_user 
FOREIGN KEY (user_id) REFERENCES users(id); 