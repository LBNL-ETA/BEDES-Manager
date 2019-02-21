select
    a.id as "_id",
    a.name as "_name",
    a.description as "_description",
    a.scope_id as "_scopeId"
from
    public.mapping_application as a
join
	public.mapping_application_roles as r on r.user_id = ${_userId} and r.app_id = a.id
order by
    name
;