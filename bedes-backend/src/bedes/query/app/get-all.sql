select
    a.id as "_id",
    a.name as "_name",
    a.description as "_description",
    a.scope_id as "_scopeId",
    CASE
        WHEN a.scope_id = 4 THEN 'BEDES'
        ELSE u.first_name || ' ' || u.last_name
        END "_ownerName"
from
    public.mapping_application as a
join
	public.mapping_application_roles as r on r.app_id = a.id and r.role_id = 1
join
    auth.user u on u.id = r.user_id
where
	a.scope_id IN (${_scopes:csv})
order by
    name
;
