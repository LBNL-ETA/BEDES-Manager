-- delete a pw reset record,
-- returns a boolean indicating if the token was valid
-- ie is the current time < expired time
delete from
    auth.pw_reset_code
where
    user_id = ${userId}
and
    uuid = ${uuid}
returning
    case when now() < expire_time then
        true
    else
        false
    end as "isValid"
;
