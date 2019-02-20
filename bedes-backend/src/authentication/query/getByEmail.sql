-- get a user record by matching email address
select 
    u.id as "_id",
    u.first_name as "_firstName",
    u.last_name as "_lastName",
    u.email as "_email",
    u.organization as "_organization",
    u.status as "_status",
    u.password as "_password",
    u.user_group_id as "_userGroupId"
from 
    auth.user u
where 
    email = ${_email}
;