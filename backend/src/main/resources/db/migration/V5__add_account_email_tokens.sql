START TRANSACTION;

ALTER TABLE app_user
    ADD COLUMN activation_token_expires_at datetime NULL,
    ADD COLUMN password_reset_token VARCHAR(255) NULL,
    ADD COLUMN password_reset_token_expires_at datetime NULL;

UPDATE app_user
SET is_activated = TRUE
WHERE is_activated IS NULL;

COMMIT;
