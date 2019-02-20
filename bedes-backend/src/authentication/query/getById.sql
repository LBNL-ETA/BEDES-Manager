-- get a user record by id
select 
    id, first_name as "firstName", last_name as "lastName", email, password, status
from 
    auth.user
where 
    id = ${id}
;
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
    id = ${_id}
;