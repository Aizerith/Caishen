start transaction;

CREATE OR REPLACE TABLE app_user_group
(
    app_user_id BIGINT NOT NULL,
    group_id    BIGINT NOT NULL
);

ALTER TABLE app_user_group
    ADD CONSTRAINT fk_appusegro_on_app_user_entity FOREIGN KEY (app_user_id) REFERENCES app_user (id);

ALTER TABLE app_user_group
    ADD CONSTRAINT fk_appusegro_on_group_entity FOREIGN KEY (group_id) REFERENCES `caishen_group` (id);

commit;