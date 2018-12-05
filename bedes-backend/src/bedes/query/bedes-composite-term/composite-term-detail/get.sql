select
    id as "_id",
    name as "_name",

from
    public.definition_source as d
where
    trim(lower(d.name)) = trim(lower(${_name}))
;