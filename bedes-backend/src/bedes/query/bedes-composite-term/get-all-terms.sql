-- Get all public terms (scope_id = 2)
select
    t.id as "_id",
    t.signature as "_signature",
    t.name as "_name",
    t.description as "_description",
    t.unit_id as "_unitId",
    t.uuid as "_uuid",
    t.user_id as "_userId",
    t.scope_id as "_scopeId",
    u.first_name || ' ' || u.last_name as "_ownerName"
from
    public.bedes_composite_term as t
join
    auth.user u on u.id = t.user_id
where
    t.scope_id != 1
order by
    t.name
;
