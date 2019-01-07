select
    d.id as "_id",
    d.name as "_name",
    d.description as "_description"
from
    public.app as d
where
    trim(lower(d.name)) = trim(lower(${_name}))
;