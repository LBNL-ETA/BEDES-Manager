select
    d.id as "_id",
    d.name as "_name",
    d.term_type_id as "_termTypeId",
    d.data_type_id as "_dataTypeId",
    d.unit_id as "_unitId"
from
    public.bedes_term as d
where
    d.name = ${_name}
;