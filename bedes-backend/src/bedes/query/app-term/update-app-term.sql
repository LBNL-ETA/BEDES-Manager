update public.app_term set
    name = ${_name},
    description = ${_description},
    term_type_id = ${_termTypeId},
    data_type_id = ${_dataTypeId},
    unit = ${_unit}
where
    id = ${_id}
returning
    id as "_id",
    field_code as "_fieldCode",
    name as "_name",
    description as "_description",
    term_type_id as "_termTypeId",
    data_type_id as "_dataTypeId",
    unit as "_unit",
    uuid as "_uuid"
;
