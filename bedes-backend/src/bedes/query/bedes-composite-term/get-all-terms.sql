-- Get all public terms (scope_id = 2)
select
    id as "_id",
    signature as "_signature",
    name as "_name",
    description as "_description",
    unit_id as "_unitId",
    uuid as "_uuid",
    user_id as "_userId",
    scope_id as "_scopeId"
from
    public.bedes_composite_term
where
    scope_id != 1
order by
    name
;
