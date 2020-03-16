insert into public.app_term (
    app_id, field_code, name, description, term_type_id, unit, uuid
)
values (
    ${_appId}, ${_fieldCode}, ${_name}, ${_description}, ${_termTypeId}, ${_unit}, ${_uuid}
)
returning
    id as "_id",
    field_code as "_fieldCode",
    name as "_name",
    description as "_description",
    term_type_id as "_termTypeId",
    unit as "_unit",
    uuid as "_uuid"
;
