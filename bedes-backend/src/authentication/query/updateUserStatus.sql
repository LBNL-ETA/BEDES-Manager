update 
    auth.user
set 
    status = ${status}
where 
    id = ${userId}
returning 
    status as "_status",
    user_group_id as "_userGroupId"
;