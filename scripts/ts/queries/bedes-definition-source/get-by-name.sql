select
    d.id as "_id",
    d.name as "_name"
from
    public.definition_source as d
where
    d.name = ${_name}
;