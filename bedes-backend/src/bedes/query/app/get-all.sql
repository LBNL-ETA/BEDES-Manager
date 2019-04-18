select
    a.id as "_id",
    a.name as "_name",
    a.description as "_description",
    a.scope_id as "_scopeId",
    u.first_name || ' ' || u.last_name as "_ownerName"
from
    public.mapping_application as a
join
	public.mapping_application_roles as r on r.app_id = a.id and r.role_id = 1
join
    auth.user u on u.id = r.user_id
where
	a.scope_id = 3
order by
    name
;
