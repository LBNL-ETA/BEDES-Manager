insert into auth.registration_code (user_id, value) values
    (${userId}, ${registrationCode})
returning
    id,
    value as "registrationCode"
;