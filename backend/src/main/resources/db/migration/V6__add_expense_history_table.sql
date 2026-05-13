START TRANSACTION;

CREATE TABLE expense_history
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    group_id      BIGINT         NOT NULL,
    expense_id    BIGINT         NOT NULL,
    expense_title VARCHAR(255)   NOT NULL,
    action        VARCHAR(32)    NOT NULL,
    actor_id      BIGINT         NOT NULL,
    actor_name    VARCHAR(255)   NOT NULL,
    amount        DECIMAL(10, 2) NOT NULL,
    created_at    datetime      NOT NULL,
    CONSTRAINT pk_expense_history PRIMARY KEY (id)
);

ALTER TABLE expense_history
    ADD CONSTRAINT fk_expense_history_on_group FOREIGN KEY (group_id) REFERENCES caishen_group (id);

ALTER TABLE expense_history
    ADD CONSTRAINT fk_expense_history_on_actor FOREIGN KEY (actor_id) REFERENCES app_user (id);

CREATE INDEX idx_expense_history_group_created_at ON expense_history (group_id, created_at);

CREATE INDEX idx_expense_history_expense_created_at ON expense_history (expense_id, created_at);

COMMIT;
