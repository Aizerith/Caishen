START TRANSACTION;

CREATE TABLE push_subscription
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    user_id    BIGINT        NOT NULL,
    endpoint   VARCHAR(1024) NOT NULL,
    p256dh     VARCHAR(512)  NOT NULL,
    auth       VARCHAR(255)  NOT NULL,
    enabled    BIT(1)        NOT NULL,
    created_at datetime      NOT NULL,
    updated_at datetime      NOT NULL,
    CONSTRAINT pk_push_subscription PRIMARY KEY (id)
);

ALTER TABLE push_subscription
    ADD CONSTRAINT uc_push_subscription_endpoint UNIQUE (endpoint);

ALTER TABLE push_subscription
    ADD CONSTRAINT fk_push_subscription_on_user FOREIGN KEY (user_id) REFERENCES app_user (id);

CREATE INDEX idx_push_subscription_user_enabled ON push_subscription (user_id, enabled);

COMMIT;
