select
    id as "_id",
    signature as "_signature",
    name as "_name",
    unit_id as "_unitId",
    data_type_id as "_dataTypeId",
    uuid as "_uuid",
    user_id as "_userId",
    scope_id as "_scopeId"
from
    public.bedes_composite_term
where
    id = ${_id}
;