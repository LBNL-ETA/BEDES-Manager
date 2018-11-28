-- get a user record by matching email address
select 
    id, first_name as "firstName", last_name as "lastName", email, password, status
from 
    auth.user
where 
    email = ${email}
;