select
    d.id as "_id",
    d.name as "_name"
from
    public.data_type as d
where
    id = ${_id}
;