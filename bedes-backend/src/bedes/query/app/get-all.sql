select
    id as "_id",
    name as "_name",
    description as "_description",
    scope_id as "_scopeId"
from
    public.mapping_application
order by
    name
;