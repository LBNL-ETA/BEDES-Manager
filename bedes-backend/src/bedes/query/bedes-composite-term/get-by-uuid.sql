select
    id as "_id",
    signature as "_signature",
    name as "_name",
    unit_id as "_unitId",
    uuid as "_uuid"
from
    public.bedes_composite_term
where
    uuid = ${_uuid}
;