-- return the user status for a specific user id
select 
    status 
from 
    auth.user
where 
    id = ${userId}
;