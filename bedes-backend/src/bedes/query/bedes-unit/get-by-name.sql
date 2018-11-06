select
    d.id as "_id",
    d.name as "_name"
from
    public.unit as d
where
    trim(lower(d.name)) = trim(lower(${_name}))
;