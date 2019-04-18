select
    a.id as "_id",
    a.name as "_name",
    a.description as "_description",
    scope_id as "_scopeId",
    u.first_name || ' ' || u.last_name as "_ownerName"
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
where
    -- get a specific application id
    a.id = ${_id}
and (
    (
        -- select public applications
        a.scope_id = 3
    )
    or (
        -- select application owners
        u.id = ${_userId}
    )
    or (
        -- admininistrators see all applications
        cu.user_group_id = 2
    )
)
;