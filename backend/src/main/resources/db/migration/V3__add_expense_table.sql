START TRANSACTION;

CREATE OR REPLACE TABLE expense
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    amount      DECIMAL(10, 2)  NOT NULL,
    participant VARCHAR(255)    NOT NULL,
    payer_id    BIGINT          NOT NULL,
    group_id    BIGINT          NOT NULL,
    CONSTRAINT pk_expense PRIMARY KEY (id)
);

ALTER TABLE expense
    ADD CONSTRAINT FK_EXPENSE_ON_GROUP FOREIGN KEY (group_id) REFERENCES caishen_group (id);

COMMIT;