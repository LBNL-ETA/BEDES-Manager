update 
    auth.user
set 
    status = ${status}
where 
    id = ${userId}
returning 
    status as "status"
;