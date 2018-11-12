select
    d.id as "_id",
    d.name as "_name",
    d.description as "_description",
    d.term_type_id as "_termTypeId",
    d.data_type_id as "_dataTypeId",
    d.unit_id as "_unitId"
from
    public.bedes_term as d
where
    trim(lower(d.name)) = trim(lower(${_name}))
;