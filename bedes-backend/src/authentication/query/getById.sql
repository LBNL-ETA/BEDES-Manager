-- get a user record by id
select 
    id, first_name as "firstName", last_name as "lastName", email, password, status
from 
    auth.user
where 
    id = ${id}
;