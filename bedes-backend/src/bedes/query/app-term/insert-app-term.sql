insert into public.app_term (
    app_id, field_code, name, description
)
values (
    ${_appId}, ${_fieldCode}, ${_name}, ${_description}
)
returning
    id as "_id",
    app_id as "_appId",
    field_code as "_fieldCode",
    name as "_name",
    description as "_description"
;