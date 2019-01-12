select
    d.id as "_id",
    d.name as "_name",
    d.description as "_description",
    scope_id as "_scopeId"
from
    public.mapping_application as d
where
    trim(lower(d.name)) = trim(lower(${_name}))
;