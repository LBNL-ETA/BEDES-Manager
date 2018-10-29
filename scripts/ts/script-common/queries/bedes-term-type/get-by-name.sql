select
    d.id as "_id",
    d.name as "_name"
from
    public.term_type as d
where
    trim(lower(d.name)) = trim(lower(${_name}))
;