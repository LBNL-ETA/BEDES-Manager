select
    d.id as "_id",
    d.name as "_name"
from
    public.unit as d
where
    id = ${_id}
;