insert into public.app_term_list_option
    (app_term_id, name, description, unit, uuid)
values
    (${_appTermId}, ${_name}, ${_description}, ${_unit}, ${_uuid})
returning
    id as "_id",
    name as "_name",
    description as "_description",
    unit as "_unit",
    uuid as "_uuid"
;
