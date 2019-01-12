insert into public.app_term (
    app_id, field_code, name, description, term_type_id
)
values (
    ${_appId}, ${_fieldCode}, ${_name}, ${_description}, ${_termTypeId}
)
returning
    id as "_id",
    app_id as "_appId",
    field_code as "_fieldCode",
    name as "_name",
    description as "_description",
    term_type_id as "_termTypeId"
;