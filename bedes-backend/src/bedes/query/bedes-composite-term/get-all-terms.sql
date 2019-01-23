select
    id as "_id",
    signature as "_signature",
    name as "_name",
    unit_id as "_unitId"
from
    public.bedes_composite_term
order by
    name
;
