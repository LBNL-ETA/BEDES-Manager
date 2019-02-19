insert into public.app_term_list_option
    (app_term_id, name, description, unit_id, uuid)
values
    (${_appTermId}, ${_name}, ${_description}, ${_unitId}, ${_uuid})
returning
    id as "_id",
    name as "_name",
    description as "_description",
    unit_id as "_unitId",
    uuid as "_uuid"
;
