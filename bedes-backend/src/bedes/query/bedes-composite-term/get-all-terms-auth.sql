-- Gets all composite terms that:
--   1. Are public
--   2. Are private and belong to the current user
select
    t.id as "_id",
    t.signature as "_signature",
    t.name as "_name",
    t.description as "_description",
    t.unit_id as "_unitId",
    t.data_type_id as "_dataTypeId",
    t.uuid as "_uuid",
    t.user_id as "_userId",
    t.scope_id as "_scopeId",
    u.first_name || ' ' || u.last_name as "_ownerName"
from
    public.bedes_composite_term as t
join
    auth.user u on u.id = t.user_id
where
    scope_id != 1
or
    (scope_id = 1 and user_id = ${_userId})
order by
    name
;
