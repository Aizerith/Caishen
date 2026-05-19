START TRANSACTION;

CREATE TABLE settlement_payment
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    group_id    BIGINT         NOT NULL,
    payer_id    BIGINT         NOT NULL,
    receiver_id BIGINT         NOT NULL,
    amount      DECIMAL(10, 2) NOT NULL,
    created_at  datetime      NOT NULL,
    CONSTRAINT pk_settlement_payment PRIMARY KEY (id)
);

ALTER TABLE settlement_payment
    ADD CONSTRAINT fk_settlement_payment_on_group FOREIGN KEY (group_id) REFERENCES caishen_group (id);

ALTER TABLE settlement_payment
    ADD CONSTRAINT fk_settlement_payment_on_payer FOREIGN KEY (payer_id) REFERENCES app_user (id);

ALTER TABLE settlement_payment
    ADD CONSTRAINT fk_settlement_payment_on_receiver FOREIGN KEY (receiver_id) REFERENCES app_user (id);

CREATE INDEX idx_settlement_payment_group_created_at ON settlement_payment (group_id, created_at);

COMMIT;
