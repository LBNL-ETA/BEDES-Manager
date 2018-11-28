select
    id,
    case
        when expire_time > now() then
            true
        else
            false
    end as "isValid"
from 
    auth.registration_code
where
    user_id = ${userId}
and
    value = ${registrationCode}
;