-- get all public mapping applications (non-authenticated call)
select
    DISTINCT a.id as "_id",
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
    -- join in owner info
	public.mapping_application_roles as r on r.app_id = a.id and r.role_id = 1
join
    -- join in owner user info
    auth.user u on u.id = r.user_id
join
    -- join in current user info
	auth.user as cu on cu.id = ${_userId}
where (
	-- select public and approved applications
	a.scope_id in (${_scopes:csv})
)
or (
	-- select application owners
	u.id = ${_userId}
)
or (
	-- admininistrators see all applications
	cu.user_group_id = 2
)
order by
    _name
;
