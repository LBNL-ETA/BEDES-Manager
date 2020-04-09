update
    public.bedes_composite_term
set
    name = ${_name},
    description = ${_description},
    signature = ${_signature},
    unit_id = ${_unitId},
    data_type_id = ${_dataTypeId},
    scope_id = ${_scopeId}
where
    id = ${_id}
returning
    id as "_id",
    signature as "_signature",
    name as "_name",
    description as "_description",
    unit_id as "_unitId",
    data_type_id as "_dataTypeId",
    uuid as "_uuid",
    user_id as "_userId",
    scope_id as "_scopeId"
;
