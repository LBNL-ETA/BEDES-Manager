
-- inserts a record
insert into auth.pw_reset_code (
    uuid,
    user_id
)
values (
    ${uuid},
    ${userId}
)
returning
    uuid
;
