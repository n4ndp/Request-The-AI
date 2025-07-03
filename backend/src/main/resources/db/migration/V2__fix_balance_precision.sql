-- Cambiar la precisión del campo balance de DECIMAL(10,8) a DECIMAL(15,2)
-- Esto permite valores hasta $9,999,999,999,999.99 en lugar de solo $99.99999999

ALTER TABLE accounts 
ALTER COLUMN balance TYPE DECIMAL(15,2); 