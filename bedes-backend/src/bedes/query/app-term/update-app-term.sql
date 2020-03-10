update public.app_term set
    name = ${_name},
    description = ${_description},
    term_type_id = ${_termTypeId},
    unit = ${_unit}
where
    id = ${_id}
returning
    id as "_id",
    field_code as "_fieldCode",
    name as "_name",
    description as "_description",
    term_type_id as "_termTypeId",
    unit as "_unit",
    uuid as "_uuid"
;
