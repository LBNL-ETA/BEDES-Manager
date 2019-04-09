select
    d.id as "_id",
    d.name as "_name",
    d.description as "_description",
    scope_id as "_scopeId",
    u.first_name || ' ' || u.last_name as "_ownerName"
from
    public.mapping_application as d
join
	public.mapping_application_roles as r on r.app_id = d.id and r.role_id = 1
join
    auth.user u on u.id = r.user_id
where
    trim(lower(d.name)) = trim(lower(${_name}))
;