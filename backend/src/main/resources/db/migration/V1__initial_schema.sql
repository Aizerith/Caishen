START TRANSACTION;

CREATE OR REPLACE TABLE app_user
(
    id                   BIGINT AUTO_INCREMENT NOT NULL,
    username             VARCHAR(255) NOT NULL,
    login                VARCHAR(255) NOT NULL,
    password             VARCHAR(255) NOT NULL,
    date_of_registration datetime     NOT NULL,
    deleted_at           datetime NULL,
    activation_link      VARCHAR(255) NULL,
    is_activated         BIT(1) NULL,
    CONSTRAINT pk_app_user PRIMARY KEY (id)
);

CREATE OR REPLACE TABLE caishen_group
(
    id    BIGINT AUTO_INCREMENT NOT NULL,
    title VARCHAR(255) NOT NULL,
    uuid  VARCHAR(36) NOT NULL,
    CONSTRAINT pk_caishen_group PRIMARY KEY (id)
);

ALTER TABLE app_user
    ADD CONSTRAINT uc_app_user_login UNIQUE (login);

ALTER TABLE app_user
    ADD CONSTRAINT uc_app_user_username UNIQUE (username);

COMMIT;