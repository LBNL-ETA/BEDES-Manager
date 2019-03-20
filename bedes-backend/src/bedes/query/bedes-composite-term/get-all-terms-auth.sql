-- Gets all composite terms that:
--   1. Are public
--   2. Are private and belong to the current user
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
    scope_id = 2
or
    (scope_id = 1 and user_id = ${_userId})
order by
    name
;
