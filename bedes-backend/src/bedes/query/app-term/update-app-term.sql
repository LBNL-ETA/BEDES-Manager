update public.app_term set
    name = ${_name},
    description = ${_description},
    term_type_id = ${_termTypeId},
    unit_id = ${_unitId}
where
    id = ${_id}
returning
    id as "_id",
    app_id as "_appId",
    field_code as "_fieldCode",
    name as "_name",
    description as "_description",
    term_type_id as "_termTypeId",
    unit_id as "_unitId",
    uuid as "_uuid"
;
