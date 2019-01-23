-- return the user status for a specific user id
select 
    status as "_status",
    user_group_id as "_userGroupId"
from 
    auth.user
where 
    id = ${userId}
;