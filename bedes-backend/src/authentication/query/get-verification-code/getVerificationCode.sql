-- Retrieve a verification code for a specified user.
-- Resulting column _isValid indicates if the registration code is still valid
-- ie the code's time constraint has not expired.
select
    id as "_id", 
    case
        when
             now() <= expire_time
        then
            true
        else
            false
    end as "_isValid"
from
    auth.registration_code
where
    user_id = ${_userId}
and
    value = ${_registrationCode}
;
