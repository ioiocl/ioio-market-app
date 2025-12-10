-- Migration: Update password hashes for users
-- Date: 2024-12-09
-- Description: Update bcrypt password hashes from $2b to $2a format

UPDATE users 
SET password_hash = '$2a$10$pU1KkRaMAcftcuzurhA3S.92QhvGkqxAWMTQ5/rylouvZrFwIrar2' 
WHERE email = 'admin@ioio.com';

UPDATE users 
SET password_hash = '$2a$10$pU1KkRaMAcftcuzurhA3S.92QhvGkqxAWMTQ5/rylouvZrFwIrar2' 
WHERE email = 'customer@example.com';
