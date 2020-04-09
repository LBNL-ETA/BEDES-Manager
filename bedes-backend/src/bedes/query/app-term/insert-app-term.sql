insert into public.app_term (
    app_id, field_code, name, description, term_type_id, data_type_id, unit, uuid
)
values (
    ${_appId}, ${_fieldCode}, ${_name}, ${_description}, ${_termTypeId}, ${_dataTypeId},  ${_unit}, ${_uuid}
)
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
