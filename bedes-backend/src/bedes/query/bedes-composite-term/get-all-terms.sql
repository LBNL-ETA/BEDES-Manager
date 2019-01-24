select
    id as "_id",
    signature as "_signature",
    name as "_name",
    description as "_description",
    unit_id as "_unitId"
from
    public.bedes_composite_term
order by
    name
;
