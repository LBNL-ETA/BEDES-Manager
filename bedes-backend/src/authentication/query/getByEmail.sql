-- get a user record by email
select 
    u.id as "_id",
    u.first_name as "_firstName",
    u.last_name as "_lastName",
    u.email as "_email",
    u.organization as "_organization",
    u.status as "_status",
    u.password as "_password",
    u.user_group_id as "_userGroupId",
	array_agg(mar.app_id) as "_appIds"
from 
    auth.user u
left outer join
	public.mapping_application_roles mar on mar.user_id = u.id
where 
    u.email = ${_email}
group by
	u.id,
	u.first_name,
	u.last_name,
	u.email,
	u.organization,
	u.status,
	u.password,
	u.user_group_id
;