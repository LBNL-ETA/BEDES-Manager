insert into public.app_term_additional_data (
    app_term_id, app_field_id, value
)
values (
    ${_appTermId}, ${_appFieldId}, ${_value}
)
returning
    id as "_id",
    app_term_id as "_appTermid",
    app_field_id as "_appFieldId",
    value as "_value"
;